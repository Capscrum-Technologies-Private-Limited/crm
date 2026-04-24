const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function test() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const clients = await prisma.client.findMany({
      include: {
        pipelineStages: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("Query Success. Number of clients:", clients.length);
    if (clients.length > 0) {
      console.log("First client stages count:", clients[0].pipelineStages.length);
    }
  } catch (e) {
    console.error("Query Failed:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
