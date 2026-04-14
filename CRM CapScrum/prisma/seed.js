require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@capscrum.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@capscrum.com",
      name: "Super Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log({ admin });

  // Create a sample client
  const clientUserPassword = await bcrypt.hash("client123", 10);
  const clientUser = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: { password: clientUserPassword },
    create: {
      email: "client@example.com",
      name: "John Doe",
      password: clientUserPassword,
      role: "CLIENT",
    },
  });

  const client = await prisma.client.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      companyName: "Acme Corp",
      contactPerson: "John Doe",
      email: "client@example.com",
      userId: clientUser.id,
      revenue: 50000,
      status: "Onboarded",
    },
  });

  console.log({ client });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
