import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const team = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "TEAM"],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    take: 10,
  });

  return NextResponse.json(team);
}
