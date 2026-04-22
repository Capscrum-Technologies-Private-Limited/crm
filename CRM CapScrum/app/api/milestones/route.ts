import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // Format: YYYY-MM
  
  let dateFilter = {};
  if (month) {
    const [year, m] = month.split("-").map(Number);
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59);
    dateFilter = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  const milestones = await prisma.milestone.findMany({
    where: dateFilter,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(milestones);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, date, type, color, projectId } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        date: new Date(date),
        type: type || "MILESTONE",
        color: color || "#3b82f6",
        projectId: projectId || null,
        assignedToId: body.assignedToId || null,
        attachmentUrl: body.attachmentUrl || null,
        createdById: session.user.id,
      },
      include: {
        project: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, completed, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
    }

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...(completed !== undefined && { completed }),
        ...(updateData.title && { title: updateData.title.trim() }),
        ...(updateData.description !== undefined && { description: updateData.description?.trim() || null }),
        ...(updateData.date && { date: new Date(updateData.date) }),
        ...(updateData.type && { type: updateData.type }),
        ...(updateData.color && { color: updateData.color }),
        ...(updateData.assignedToId !== undefined && { assignedToId: updateData.assignedToId }),
        ...(updateData.attachmentUrl !== undefined && { attachmentUrl: updateData.attachmentUrl }),
      },
      include: {
        project: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
    }

    await prisma.milestone.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}
