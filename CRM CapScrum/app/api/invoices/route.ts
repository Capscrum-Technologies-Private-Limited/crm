import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 2; // Test limit for UI verification
  const skip = (page - 1) * limit;

  try {
    if (role === "CLIENT") {
      const client = await prisma.client.findFirst({ where: { userId: session.user.id } });
      if (!client) return NextResponse.json({ error: "Client profile not found" }, { status: 404 });

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where: { clientId: client.id },
          orderBy: { createdAt: "desc" },
          include: { project: { select: { name: true } } },
          skip,
          take: limit
        }),
        prisma.invoice.count({ where: { clientId: client.id } })
      ]);
      return NextResponse.json({ data: invoices, totalPages: Math.ceil(total / limit) });
    } else {
      // ADMIN or TEAM
      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            client: { select: { companyName: true, contactPerson: true } },
            project: { select: { name: true } }
          },
          skip,
          take: limit
        }),
        prisma.invoice.count()
      ]);
      return NextResponse.json({ data: invoices, totalPages: Math.ceil(total / limit) });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { clientId, projectId, amount, description, dueDate, status } = await request.json();

    if (!clientId || !amount || !description || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate Invoice Number (e.g., INV-2026-0415-XXXX)
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const invoiceNumber = `INV-${timestamp}-${random}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        projectId: projectId || null,
        amount: parseFloat(amount),
        description,
        dueDate: new Date(dueDate),
        status: status || "PENDING",
      },
      include: {
        client: { select: { companyName: true, user: { select: { id: true } } } }
      }
    });

    // Automatically trigger a notification to the client if they have a userId attached
    if (invoice.client?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: invoice.client.user.id,
          title: "New Invoice Issued",
          message: `A new invoice (${invoice.invoiceNumber}) for ₹${invoice.amount.toLocaleString()} has been issued.`,
          link: "/portal/invoices"
        }
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { client: { select: { userId: true } } } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });



    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === "PAID" ? new Date() : null
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
