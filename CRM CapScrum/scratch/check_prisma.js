const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  try {
    const fields = Object.keys(prisma.project.fields || {});
    console.log('Project fields:', fields);
    
    // Check first project
    const project = await prisma.project.findFirst();
    console.log('Sample project:', project);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
