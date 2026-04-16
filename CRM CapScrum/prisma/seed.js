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
  console.log("🌱 Seeding database...\n");

  // 1. Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const clientPassword = await bcrypt.hash("client123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@capscrum.com" },
    update: { password: adminPassword },
    create: { email: "admin@capscrum.com", name: "Super Admin", password: adminPassword, role: "ADMIN" },
  });
  console.log("✅ Admin user:", admin.email);

  const clientUser1 = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: { password: clientPassword },
    create: { email: "client@example.com", name: "John Doe", password: clientPassword, role: "CLIENT" },
  });

  const clientUser2 = await prisma.user.upsert({
    where: { email: "sarah@techvision.com" },
    update: { password: clientPassword },
    create: { email: "sarah@techvision.com", name: "Sarah Chen", password: clientPassword, role: "CLIENT" },
  });

  const teamUser = await prisma.user.upsert({
    where: { email: "dev@capscrum.com" },
    update: { password: adminPassword },
    create: { email: "dev@capscrum.com", name: "Dev Team", password: adminPassword, role: "TEAM" },
  });

  console.log("✅ Users created");

  // 2. Clients
  const client1 = await prisma.client.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      companyName: "Acme Corp",
      contactPerson: "John Doe",
      email: "client@example.com",
      phone: "+91 9876543210",
      userId: clientUser1.id,
      revenue: 150000,
      status: "Onboarded",
      industry: "Technology",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { email: "sarah@techvision.com" },
    update: {},
    create: {
      companyName: "TechVision Labs",
      contactPerson: "Sarah Chen",
      email: "sarah@techvision.com",
      phone: "+91 9123456789",
      userId: clientUser2.id,
      revenue: 250000,
      status: "Onboarded",
      industry: "SaaS",
    },
  });

  const client3 = await prisma.client.upsert({
    where: { email: "info@designstudio.com" },
    update: {},
    create: {
      companyName: "Design Studio Pro",
      contactPerson: "Mike Rivera",
      email: "info@designstudio.com",
      revenue: 75000,
      status: "Pipeline",
      industry: "Design",
    },
  });

  console.log("✅ Clients created");

  // 3. Projects
  const project1 = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      name: "E-Commerce Platform",
      description: "Full-stack e-commerce platform with payment integrations and admin dashboard.",
      status: "IN_PROGRESS",
      progress: 65,
      clientId: client1.id,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-06-30"),
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: "seed-project-2" },
    update: {},
    create: {
      id: "seed-project-2",
      name: "SaaS Dashboard Redesign",
      description: "Complete UI/UX overhaul of the analytics dashboard with new charts and reports.",
      status: "IN_PROGRESS",
      progress: 40,
      clientId: client2.id,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-08-15"),
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: "seed-project-3" },
    update: {},
    create: {
      id: "seed-project-3",
      name: "Mobile App MVP",
      description: "React Native mobile application for client-facing operations.",
      status: "PENDING",
      progress: 0,
      clientId: client1.id,
      startDate: new Date("2026-05-01"),
    },
  });

  console.log("✅ Projects created");

  // 4. Billing Stages
  const stages = [
    { name: "Discovery & Planning", price: 25000, order: 1, isPaid: true, projectId: project1.id },
    { name: "UI/UX Design", price: 35000, order: 2, isPaid: true, projectId: project1.id },
    { name: "Development", price: 60000, order: 3, isPaid: false, projectId: project1.id },
    { name: "Testing & QA", price: 15000, order: 4, isPaid: false, projectId: project1.id },
    { name: "Deployment", price: 15000, order: 5, isPaid: false, projectId: project1.id },
  ];

  for (const stage of stages) {
    await prisma.billingStage.create({ data: { ...stage, paidAt: stage.isPaid ? new Date() : null } });
  }
  console.log("✅ Billing stages created");

  // 5. Invoices with line items
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-202604-0001",
      clientId: client1.id,
      projectId: project1.id,
      subtotal: 60000,
      taxRate: 18,
      taxAmount: 10800,
      discount: 0,
      total: 70800,
      amount: 70800,
      description: "Discovery + UI/UX Design phases",
      status: "PAID",
      dueDate: new Date("2026-04-30"),
      paidAt: new Date("2026-04-10"),
      items: {
        create: [
          { description: "Discovery & Planning", quantity: 1, rate: 25000, amount: 25000 },
          { description: "UI/UX Design", quantity: 1, rate: 35000, amount: 35000 },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-202604-0002",
      clientId: client2.id,
      projectId: project2.id,
      subtotal: 40000,
      taxRate: 18,
      taxAmount: 7200,
      discount: 2000,
      total: 45200,
      amount: 45200,
      description: "Dashboard redesign - Phase 1",
      status: "PENDING",
      dueDate: new Date("2026-05-15"),
      items: {
        create: [
          { description: "Research & Wireframes", quantity: 1, rate: 15000, amount: 15000 },
          { description: "High-fidelity Mockups", quantity: 1, rate: 25000, amount: 25000 },
        ],
      },
    },
  });

  console.log("✅ Invoices created");

  // 6. Pipeline
  await prisma.pipeline.createMany({
    data: [
      { clientId: client1.id, stage: "WON", value: 150000 },
      { clientId: client2.id, stage: "WON", value: 250000 },
      { clientId: client3.id, stage: "PROPOSAL_SENT", value: 75000 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Pipeline entries created");

  // 7. Expenses
  await prisma.expense.createMany({
    data: [
      { description: "AWS Hosting - April", amount: 4500, category: "SOFTWARE", date: new Date("2026-04-01") },
      { description: "Figma Pro License", amount: 1200, category: "SOFTWARE", date: new Date("2026-04-05") },
      { description: "Team Lunch Meeting", amount: 3200, category: "OPERATIONS", date: new Date("2026-04-10") },
      { description: "Google Ads Campaign", amount: 15000, category: "MARKETING", date: new Date("2026-04-12") },
      { description: "Office Rent - April", amount: 25000, category: "OFFICE", date: new Date("2026-04-01") },
    ],
  });
  console.log("✅ Expenses created");

  // 8. Milestones
  await prisma.milestone.createMany({
    data: [
      { title: "Sprint 3 Review", date: new Date("2026-04-20"), type: "MILESTONE", color: "#3b82f6", projectId: project1.id, createdById: admin.id },
      { title: "Client Demo", date: new Date("2026-04-25"), type: "MEETING", color: "#10b981", projectId: project1.id, createdById: admin.id },
      { title: "Phase 1 Deadline", date: new Date("2026-04-30"), type: "DEADLINE", color: "#ef4444", projectId: project2.id, createdById: admin.id },
    ],
  });
  console.log("✅ Milestones created");

  // 9. Default Invoice Template
  await prisma.template.upsert({
    where: { id: "default-template" },
    update: {},
    create: {
      id: "default-template",
      name: "Professional Blue",
      type: "INVOICE",
      layout: "classic",
      colorPrimary: "#3b82f6",
      colorSecondary: "#1e293b",
      footerText: "Thank you for your business. Payment is expected within the due date.",
      isDefault: true,
    },
  });
  console.log("✅ Default template created");

  // 10. Notifications
  if (clientUser1) {
    await prisma.notification.createMany({
      data: [
        { userId: clientUser1.id, title: "Welcome to CapScrum", message: "Your client portal is ready. Explore your projects and invoices.", link: "/portal" },
        { userId: clientUser1.id, title: "Invoice Paid", message: "Payment confirmed for INV-202604-0001. Thank you!", link: "/portal/invoices" },
      ],
    });
  }
  console.log("✅ Notifications created");

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
