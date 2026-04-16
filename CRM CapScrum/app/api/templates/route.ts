import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { invoices: true } } },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Templates GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, layout, colorPrimary, colorSecondary, logoUrl, headerText, footerText, isDefault } = body;
    let { type } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // Normalize type
    const templateType = (type?.toUpperCase() === "EMAIL" ? "EMAIL" : "INVOICE") as any;

    // If setting as default, unset other defaults of same type
    if (isDefault) {
      await prisma.template.updateMany({
        where: { type: templateType, isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.template.create({
      data: {
        name,
        type: templateType,
        layout: layout || "classic",
        colorPrimary: colorPrimary || "#3b82f6",
        colorSecondary: colorSecondary || "#1e293b",
        logoUrl: logoUrl || null,
        headerText: headerText || null,
        footerText: footerText || null,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Templates POST Error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { 
      id, 
      name, 
      type, 
      layout, 
      colorPrimary, 
      colorSecondary, 
      logoUrl, 
      headerText, 
      footerText, 
      isDefault 
    } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const templateType = type ? (type.toUpperCase() === "EMAIL" ? "EMAIL" : "INVOICE") : undefined;

    if (isDefault) {
      const existing = await prisma.template.findUnique({ where: { id } });
      if (existing) {
        await prisma.template.updateMany({
          where: { type: templateType || existing.type, isDefault: true },
          data: { isDefault: false },
        });
      }
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        name,
        type: templateType,
        layout,
        colorPrimary,
        colorSecondary,
        logoUrl,
        headerText,
        footerText,
        isDefault,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Templates PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    await prisma.template.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Templates DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
