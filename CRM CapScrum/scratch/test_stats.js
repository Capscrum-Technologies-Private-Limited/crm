const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function test() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const stats = await prisma.client.count();
    console.log("Stats count success:", stats);
  } catch (e) {
    console.error("Stats count failed:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
