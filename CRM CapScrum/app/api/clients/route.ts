import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(clients);
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
