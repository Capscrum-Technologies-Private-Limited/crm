import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If client, only show their projects
  const where = session.user.role === "CLIENT" 
    ? { client: { userId: session.user.id } }
    : {};

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, description, clientId, status, startDate, endDate } = data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        clientId,
        status: status || "PENDING",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
