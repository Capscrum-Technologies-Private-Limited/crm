import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isAll = searchParams.get("all") === "true";
  
  if (isAll) {
    const clients = await prisma.client.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.client.count()
  ]);

  return NextResponse.json({
    data: clients,
    totalPages: Math.ceil(total / limit)
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { companyName, contactPerson, email, phone, revenue, status, shouldOnboard, industry, currency } = data;

    let userId: string | undefined;

    if (shouldOnboard) {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash("client123", 10);
        user = await prisma.user.create({
          data: {
            email,
            name: contactPerson,
            password: hashedPassword,
            role: "CLIENT",
          },
        });
      }

      userId = user.id;
    }

    const client = await prisma.client.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        revenue: parseFloat(revenue) || 0,
        status: shouldOnboard ? "Onboarded" : (status || "Pipeline"),
        industry: industry || null,
        currency: currency || "INR",
        userId,
      },
    });

    // Send welcome email if onboarding
    if (shouldOnboard) {
      sendWelcomeEmail({
        email,
        contactPerson,
        companyName,
      }).catch(console.error);
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.client.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { id, companyName, contactPerson, email, phone, revenue, status, industry, currency } = data;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const client = await prisma.client.update({
      where: { id },
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        revenue: parseFloat(revenue) || 0,
        status,
        industry,
        currency,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}
