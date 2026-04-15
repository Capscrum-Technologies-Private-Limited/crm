import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If client, only show their projects
  const where = session.user.role === "CLIENT" 
    ? { client: { userId: session.user.id } }
    : {};

  const { searchParams } = new URL(req.url);
  const isAll = searchParams.get("all") === "true";

  if (isAll) {
    const projects = await prisma.project.findMany({
      where,
      include: { client: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(projects);
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = 2; // Test limit for UI verification
  const skip = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { client: true },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.project.count({ where })
  ]);

  return NextResponse.json({
    data: projects,
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
