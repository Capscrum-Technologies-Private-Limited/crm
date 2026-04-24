import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      clientCount,
      projectCount,
      activeProjects,
      completedProjects,
      totalRevenue,
      invoiceStats,
      expenseTotal,
      recentClients,
      recentInvoices,
      recentProjects,
      milestonePaidTotal,
      milestoneUnpaidTotal,
      milestonePaidCount,
      milestoneUnpaidCount,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.client.aggregate({ _sum: { revenue: true } }),
      prisma.invoice.groupBy({
        by: ["status"],
        _sum: { total: true, amount: true },
        _count: { _all: true },
      }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.client.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, companyName: true, contactPerson: true, status: true, createdAt: true },
      }),
      prisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, invoiceNumber: true, total: true, amount: true, status: true, createdAt: true, client: { select: { companyName: true } } },
      }),
      prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, name: true, status: true, progress: true, updatedAt: true, client: { select: { companyName: true } } },
      }),
      // Milestone BillingStage aggregations
      prisma.billingStage.aggregate({ where: { isPaid: true }, _sum: { price: true } }),
      prisma.billingStage.aggregate({ where: { isPaid: false }, _sum: { price: true } }),
      prisma.billingStage.count({ where: { isPaid: true } }),
      prisma.billingStage.count({ where: { isPaid: false } }),
    ]);

    // Calculate invoice totals
    const paidInvoices = invoiceStats.find(s => s.status === "PAID");
    const pendingInvoices = invoiceStats.find(s => s.status === "PENDING");
    const overdueInvoices = invoiceStats.find(s => s.status === "OVERDUE");
    const sentInvoices = invoiceStats.find(s => s.status === "SENT");

    const totalPaid = (paidInvoices?._sum?.total || 0) + (paidInvoices?._sum?.amount || 0);
    const totalPending = (pendingInvoices?._sum?.total || 0) + (pendingInvoices?._sum?.amount || 0);
    const totalOverdue = (overdueInvoices?._sum?.total || 0) + (overdueInvoices?._sum?.amount || 0);
    const totalSent = (sentInvoices?._sum?.total || 0) + (sentInvoices?._sum?.amount || 0);

    // Milestone payment tracking
    const milestoneReceived = milestonePaidTotal._sum.price || 0;
    const milestoneYetToReceive = milestoneUnpaidTotal._sum.price || 0;

    // Combined payment metrics (Invoice + Milestone based)
    const amountReceived = totalPaid + milestoneReceived;
    const yetToReceive = totalPending + totalOverdue + totalSent + milestoneYetToReceive;

    // Build activity feed from real data
    const activities: { type: string; title: string; description: string; time: string; link?: string }[] = [];

    for (const c of recentClients) {
      activities.push({
        type: "client",
        title: `Client ${c.status === "Onboarded" ? "Onboarded" : "Added"}`,
        description: `${c.companyName} — ${c.contactPerson}`,
        time: c.createdAt.toISOString(),
        link: "/dashboard/clients",
      });
    }

    for (const inv of recentInvoices) {
      activities.push({
        type: "invoice",
        title: `Invoice ${inv.status === "PAID" ? "Paid" : "Issued"}`,
        description: `${inv.invoiceNumber} — ₹${(inv.total || inv.amount || 0).toLocaleString()} for ${inv.client.companyName}`,
        time: inv.createdAt.toISOString(),
        link: "/dashboard/invoices",
      });
    }

    for (const p of recentProjects) {
      activities.push({
        type: "project",
        title: `Project ${p.status === "COMPLETED" ? "Completed" : "Updated"}`,
        description: `${p.name} — ${p.progress}% (${p.client.companyName})`,
        time: p.updatedAt.toISOString(),
        link: "/dashboard/projects",
      });
    }

    // Sort by time descending and take top 10
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({
      clientCount,
      projectCount,
      activeProjects,
      completedProjects,
      totalRevenue: totalRevenue._sum.revenue || 0,
      totalPaid,
      totalPending,
      totalOverdue,
      totalSent,
      overdueCount: overdueInvoices?._count?._all || 0,
      totalExpenses: expenseTotal._sum.amount || 0,
      // Milestone payment tracking
      amountReceived,
      yetToReceive,
      milestoneReceived,
      milestoneYetToReceive,
      milestonesPaid: milestonePaidCount,
      milestonesPending: milestoneUnpaidCount,
      activities: activities.slice(0, 10),
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
