import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const clientId = searchParams.get("clientId");

  // Define authorization filter
  let where: any = {};
  
  if (session.user.role === "CLIENT") {
    // Clients only see their own payments
    where.clientId = (await prisma.client.findUnique({ where: { userId: session.user.id } }))?.id;
    if (!where.clientId) return NextResponse.json([]);
    
    // If they ask for a specific project, ensure it's theirs
    if (projectId) where.projectId = projectId;
  } else {
    // Admin/Team can see everything, or filter by project/client
    if (projectId) where.projectId = projectId;
    if (clientId) where.clientId = clientId;
  }

  try {
    const payments = await prisma.payment.findMany({
      where,
      include: {
        project: { select: { name: true, totalValue: true } },
        client: { select: { companyName: true } }
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { amount, type, date, notes, projectId, clientId } = data;

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        type,
        date: date ? new Date(date) : new Date(),
        notes,
        projectId,
        clientId,
      },
    });

    // Optionally update project totals here if we want cached values, 
    // but we can also calculate them on the fly in stats.

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
  }

  try {
    await prisma.payment.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
  }
}
