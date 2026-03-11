const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  // 1) tenta contar
  try {
    const n = await prisma.auditLog.count();
    console.log("OK: tabela existe. AUDITLOG COUNT =", n);
  } catch (e) {
    console.log("FALHOU contar auditLog (provavel tabela nao existe ainda):");
    console.log(String(e.message || e));
  }

  // 2) checa direto no Postgres via query (information_schema)
  try {
    const rows = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name ILIKE 'audit%';
    `;
    console.log("Tabelas public.audit% =", rows);
  } catch (e) {
    console.log("FALHOU queryRaw em information_schema:");
    console.log(String(e.message || e));
  }

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
