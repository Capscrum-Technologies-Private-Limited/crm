import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendInvoiceEmail } from "@/lib/email";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const where: any = {};

    if (role === "CLIENT") {
      const client = await prisma.client.findFirst({ where: { userId: session.user.id } });
      if (!client) return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
      where.clientId = client.id;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { companyName: true, contactPerson: true, email: true, phone: true } },
          project: { select: { name: true } },
          items: { orderBy: { createdAt: "asc" } },
          template: { select: { id: true, name: true, layout: true, colorPrimary: true } },
        },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      data: invoices,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Invoice fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { clientId, projectId, dueDate, notes, taxRate, discount, templateId, items } = body;

    if (!clientId || !dueDate) {
      return NextResponse.json({ error: "Client and due date are required" }, { status: 400 });
    }

    // Calculate totals from line items
    const lineItems: { description: string; quantity: number; rate: number; amount: number }[] = [];
    let subtotal = 0;

    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const qty = parseFloat(item.quantity) || 1;
        const rate = parseFloat(item.rate) || 0;
        const amount = qty * rate;
        lineItems.push({
          description: item.description || "Line item",
          quantity: qty,
          rate,
          amount,
        });
        subtotal += amount;
      }
    } else if (body.amount && body.description) {
      // Backward compatibility: single amount + description
      const amt = parseFloat(body.amount);
      lineItems.push({
        description: body.description,
        quantity: 1,
        rate: amt,
        amount: amt,
      });
      subtotal = amt;
    }

    const tax = parseFloat(taxRate as string) || 0;
    const disc = parseFloat(discount as string) || 0;
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount - disc;

    // Generate Invoice Number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const count = await prisma.invoice.count() + 1;
    const invoiceNumber = `INV-${year}${month}-${String(count).padStart(4, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        projectId: projectId || null,
        templateId: templateId || null,
        subtotal,
        taxRate: tax,
        taxAmount,
        discount: disc,
        total,
        amount: total, // backward compat
        description: lineItems.map(i => i.description).join(", "), // backward compat 
        notes: notes || null,
        dueDate: new Date(dueDate),
        status: body.status || "PENDING",
        items: {
          create: lineItems,
        },
      },
      include: {
        client: { select: { companyName: true, contactPerson: true, email: true, user: { select: { id: true } } } },
        items: true,
      },
    });

    // Notify client
    if (invoice.client?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: invoice.client.user.id,
          title: "New Invoice Issued",
          message: `Invoice ${invoice.invoiceNumber} for ₹${invoice.total.toLocaleString()} has been issued.`,
          link: "/portal/invoices",
        },
      });
    }

    if (invoice.status === "SENT" || invoice.status === "PENDING") {
      sendInvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        dueDate: invoice.dueDate.toISOString(),
        clientEmail: invoice.client.email,
        clientName: invoice.client.contactPerson,
        companyName: invoice.client.companyName,
        description: invoice.description || "Services Rendered",
      }).catch(console.error);
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Invoice creation error:", error);
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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: { select: { userId: true, companyName: true, contactPerson: true, email: true } } },
    });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    // Notify client on status changes
    if (invoice.client?.userId) {
      const statusMessages: Record<string, string> = {
        SENT: `Invoice ${invoice.invoiceNumber} has been sent for review.`,
        PAID: `Payment confirmed for invoice ${invoice.invoiceNumber}. Thank you!`,
        OVERDUE: `Invoice ${invoice.invoiceNumber} is now overdue. Please make payment.`,
      };

      if (statusMessages[status]) {
        await prisma.notification.create({
          data: {
            userId: invoice.client.userId,
            title: `Invoice ${status === "PAID" ? "Paid" : "Updated"}`,
            message: statusMessages[status],
            link: "/portal/invoices",
          },
        });
      }
    }

    if (status === "SENT") {
      sendInvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        dueDate: invoice.dueDate.toISOString(),
        clientEmail: invoice.client.email,
        clientName: invoice.client.contactPerson,
        companyName: invoice.client.companyName,
        description: invoice.description || "Services Rendered",
      }).catch(console.error);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Invoice update error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
