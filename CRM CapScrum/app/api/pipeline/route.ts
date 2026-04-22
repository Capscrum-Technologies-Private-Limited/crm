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
        stage: stage || "LEAD_IDENTIFICATION",
        value: parseFloat(value) || 0,
      },
    });

    return NextResponse.json(pipeline);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create pipeline item" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    console.log("Pipeline Update Request:", data); // DEBUG
    const { id, stage, value, clientId } = data;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const pipeline = await prisma.pipeline.update({
      where: { id },
      data: {
        ...(stage && { stage }),
        ...(value !== undefined && { value: parseFloat(value) || 0 }),
        ...(clientId && { clientId }),
      },
    });

    console.log("Pipeline Updated Successfully:", pipeline.id); // DEBUG
    return NextResponse.json(pipeline);
  } catch (error: any) {
    console.error("Pipeline update failure:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to update pipeline",
      details: error.message 
    }, { status: 500 });
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
    await prisma.pipeline.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
