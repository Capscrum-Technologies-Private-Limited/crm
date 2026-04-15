import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

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
  const limit = 2; // Test limit for UI verification
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
    const { companyName, contactPerson, email, phone, revenue, status, shouldOnboard } = data;

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
        userId,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
