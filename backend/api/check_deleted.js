require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();
  const rows = await p.$queryRawUnsafe(`
    SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
    FROM "_prisma_migrations"
    WHERE migration_name = '20260303204051_drift_fix_requestid'
  `);
  console.log("Rows:", rows);
  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
