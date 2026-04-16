import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;
  const category = searchParams.get("category");
  const projectId = searchParams.get("projectId");

  const where: any = {};
  if (category) where.category = category;
  if (projectId) where.projectId = projectId;

  try {
    const [expenses, total, categoryTotals] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        include: { project: { select: { name: true } } },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
      prisma.expense.groupBy({
        by: ["category"],
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const grandTotal = categoryTotals.reduce((acc, c) => acc + (c._sum.amount || 0), 0);

    return NextResponse.json({
      data: expenses,
      totalPages: Math.ceil(total / limit),
      total,
      grandTotal,
      byCategory: categoryTotals.map(c => ({
        category: c.category,
        total: c._sum.amount || 0,
        count: c._count,
      })),
    });
  } catch (error) {
    console.error("Expenses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { description, amount, category, date, projectId, receipt } = await request.json();

    if (!description || !amount) {
      return NextResponse.json({ error: "Description and amount are required" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category: category || "OTHER",
        date: date ? new Date(date) : new Date(),
        projectId: projectId || null,
        receipt: receipt || null,
      },
      include: { project: { select: { name: true } } },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Expense creation error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
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
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
