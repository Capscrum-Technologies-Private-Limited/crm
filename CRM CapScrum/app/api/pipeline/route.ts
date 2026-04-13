import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pipelines = await prisma.pipeline.findMany({
    include: {
      client: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(pipelines);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { clientId, stage, value } = data;

    const pipeline = await prisma.pipeline.create({
      data: {
        clientId,
        stage: stage || "LEAD",
        value: parseFloat(value) || 0,
      },
    });

    return NextResponse.json(pipeline);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create pipeline item" }, { status: 500 });
  }
}
