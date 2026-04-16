import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const stages = await prisma.billingStage.findMany({
      where: { projectId: id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(stages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stages" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { name, description, price, order } = await request.json();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Auto-determine order if not provided
    let stageOrder = order;
    if (stageOrder === undefined) {
      const maxOrder = await prisma.billingStage.aggregate({
        where: { projectId: id },
        _max: { order: true },
      });
      stageOrder = (maxOrder._max.order || 0) + 1;
    }

    const stage = await prisma.billingStage.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price) || 0,
        order: stageOrder,
        projectId: id,
      },
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create billing stage" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { stageId, isPaid, isApproved, name, price, order } = await request.json();

    if (!stageId) return NextResponse.json({ error: "Stage ID required" }, { status: 400 });

    const data: any = {};
    if (isPaid !== undefined) {
      data.isPaid = isPaid;
      data.paidAt = isPaid ? new Date() : null;
    }
    if (isApproved !== undefined) data.isApproved = isApproved;
    if (name) data.name = name;
    if (price !== undefined) data.price = parseFloat(price);
    if (order !== undefined) data.order = order;

    const stage = await prisma.billingStage.update({
      where: { id: stageId },
      data,
    });

    return NextResponse.json(stage);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update billing stage" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const stageId = searchParams.get("stageId");

  if (!stageId) return NextResponse.json({ error: "Stage ID required" }, { status: 400 });

  try {
    await prisma.billingStage.delete({ where: { id: stageId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete stage" }, { status: 500 });
  }
}
