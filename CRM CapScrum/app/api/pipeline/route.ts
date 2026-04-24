// Pipeline API - Last Updated: 2026-04-24T12:00:00Z
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isClient = session.user.role === "CLIENT";
    
    // Define the filter based on role
    const where: any = {};
    if (isClient) {
      // Find the client record associated with this user
      const clientRecord = await prisma.client.findUnique({
        where: { userId: session.user.id }
      });
      if (!clientRecord) return NextResponse.json([]);
      where.id = clientRecord.id;
    }

    console.log(`Fetching pipeline stages for ${isClient ? "client: " + where.id : "all clients"}...`);
    
    // Get clients with their pipeline stages and projects
    const clients = await prisma.client.findMany({
      where,
      include: {
        pipelineStages: {
          orderBy: {
            order: "asc",
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            progress: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(`Found ${clients.length} clients`);
    
    // Explicitly map to plain objects to avoid potential circular references or Prisma-specific properties
    const sanitizedClients = clients.map(client => ({
      id: client.id,
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      status: client.status,
      projects: client.projects,
      pipelineStages: (client as any).pipelineStages.map((stage: any) => ({
        id: stage.id,
        name: stage.name,
        description: stage.description,
        percentage: stage.percentage,
        order: stage.order,
        isCompleted: stage.isCompleted,
        completedAt: stage.completedAt,
        projectId: stage.projectId,
      })),
    }));

    return NextResponse.json(sanitizedClients);
  } catch (error: any) {
    console.error("Pipeline GET error:", error.message || error);
    return NextResponse.json({ error: "Failed to fetch pipeline data", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { clientId, name, description, percentage, order, isBatch, stages, projectId } = data;

    if (isBatch && Array.isArray(stages)) {
      // Use dynamic where to bypass static type checks if they are stale in the dev server
      const deleteWhere: any = { 
        clientId,
        projectId: projectId || null
      };

      await (prisma.clientPipelineStage as any).deleteMany({
        where: deleteWhere
      });
      
      // Create multiple stages at once (e.g., initialization)
      const createdStages = await (prisma.clientPipelineStage as any).createMany({
        data: stages.map((s: any) => ({
          clientId,
          projectId: projectId || null,
          name: s.name,
          description: s.description || "",
          percentage: parseInt(s.percentage) || 0,
          order: parseInt(s.order) || 0,
        })),
      });
      return NextResponse.json(createdStages);
    }

    if (data.isReorder && Array.isArray(stages)) {
      // Handle bulk order update
      const updates = stages.map((s: any) => 
        prisma.clientPipelineStage.update({
          where: { id: s.id },
          data: { order: s.order }
        })
      );
      await prisma.$transaction(updates);
      return NextResponse.json({ success: true });
    }

    if (!clientId || !name) {
      return NextResponse.json({ error: "Client ID and Name are required" }, { status: 400 });
    }

    const stage = await prisma.clientPipelineStage.create({
      data: {
        clientId,
        projectId: projectId || null,
        name,
        description,
        percentage: parseInt(percentage) || 0,
        order: parseInt(order) || 0,
      },
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("Pipeline Stage Creation Error:", error);
    return NextResponse.json({ error: "Failed to create pipeline stage" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { id, name, description, percentage, order, isCompleted } = data;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Check if stage is already finalized
    const existingStage = await prisma.clientPipelineStage.findUnique({
      where: { id }
    });

    if (existingStage?.isCompleted) {
      return NextResponse.json({ error: "Finalized stages cannot be modified" }, { status: 403 });
    }

    const stage = await prisma.clientPipelineStage.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(percentage !== undefined && { percentage: parseInt(percentage) || 0 }),
        ...(order !== undefined && { order: parseInt(order) || 0 }),
        ...(isCompleted !== undefined && { 
          isCompleted,
          completedAt: isCompleted ? new Date() : null
        }),
      },
    });

    return NextResponse.json(stage);
  } catch (error: any) {
    console.error("Pipeline stage update failure:", error.message || error);
    return NextResponse.json({ 
      error: "Failed to update pipeline stage",
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
    // 1. Get the stage to be deleted to know its weight and clientId
    const stageToDelete = await prisma.clientPipelineStage.findUnique({
      where: { id },
      select: { percentage: true, clientId: true }
    });

    if (!stageToDelete) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    const { percentage: deletedWeight, clientId } = stageToDelete;

    // 2. Get all other stages for this client
    const remainingStages = await prisma.clientPipelineStage.findMany({
      where: { 
        clientId,
        id: { not: id }
      },
      orderBy: { order: "asc" }
    });

    if (remainingStages.length > 0 && deletedWeight > 0) {
      const totalRemainingWeight = remainingStages.reduce((sum, s) => sum + s.percentage, 0);
      
      let updates = [];
      
      if (totalRemainingWeight === 0) {
        // Distribute equally if all remaining are 0
        const extraPerStage = Math.floor(deletedWeight / remainingStages.length);
        const remainder = deletedWeight % remainingStages.length;
        
        updates = remainingStages.map((s, index) => {
          const added = index === remainingStages.length - 1 ? extraPerStage + remainder : extraPerStage;
          return prisma.clientPipelineStage.update({
            where: { id: s.id },
            data: { percentage: s.percentage + added }
          });
        });
      } else {
        // Distribute proportionally
        let distributedWeight = 0;
        updates = remainingStages.map((s, index) => {
          let added = 0;
          if (index === remainingStages.length - 1) {
            // Last stage gets the remainder to ensure exact sum
            added = deletedWeight - distributedWeight;
          } else {
            added = Math.round((s.percentage / totalRemainingWeight) * deletedWeight);
            distributedWeight += added;
          }
          
          return prisma.clientPipelineStage.update({
            where: { id: s.id },
            data: { percentage: s.percentage + added }
          });
        });
      }

      // 3. Execute updates and deletion in a transaction
      await prisma.$transaction([
        ...updates,
        prisma.clientPipelineStage.delete({ where: { id } })
      ]);
    } else {
      // Just delete if no other stages or no weight to distribute
      await prisma.clientPipelineStage.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete", details: error.message }, { status: 500 });
  }
}
