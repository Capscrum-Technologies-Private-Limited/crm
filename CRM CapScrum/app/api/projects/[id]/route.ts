import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendProjectCompletionEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { status, progress, goal, stretchGoal, endDate } = data;
    const { id } = await params;

    const project = await prisma.project.update({
      where: { id },
      data: {
        status: status || undefined,
        progress: progress !== undefined ? parseInt(progress) : undefined,
        goal: goal !== undefined ? parseInt(goal) : undefined,
        stretchGoal: stretchGoal !== undefined ? parseInt(stretchGoal) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        client: { select: { companyName: true, contactPerson: true, email: true } },
      },
    });

    if (status === "COMPLETED") {
      sendProjectCompletionEmail({
        name: project.name,
        clientEmail: project.client.email,
        clientName: project.client.contactPerson,
        companyName: project.client.companyName,
      }).catch(console.error);
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // If client, ensure they own the project
  if (session.user.role === "CLIENT" && project.client.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(project);
}
