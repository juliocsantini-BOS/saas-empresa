const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'AuditLog';
    `;
    console.log("AuditLog existe? ->", rows.length > 0, rows);
  } catch (e) {
    console.log("Falhou checar information_schema:", String(e.message || e));
  }
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
