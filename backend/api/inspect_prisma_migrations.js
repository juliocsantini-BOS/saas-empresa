require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();

  const name = "20260303204051_drift_fix_requestid";

  const rows = await p.$queryRawUnsafe(`
    SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count
    FROM "_prisma_migrations"
    WHERE migration_name = '${name}'
  `);

  console.log("\n== ROWS for missing migration ==");
  console.table(rows);

  const last = await p.$queryRawUnsafe(`
    SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count
    FROM "_prisma_migrations"
    ORDER BY started_at DESC
    LIMIT 12
  `);

  console.log("\n== LAST 12 migrations in DB ==");
  console.table(last);

  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
