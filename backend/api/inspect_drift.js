require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();

  const enumVals = await p.$queryRawUnsafe(`
    SELECT e.enumlabel
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'Role'
    ORDER BY e.enumsortorder;
  `);

  console.log("\n== Role enum values ==");
  console.table(enumVals);

  const idx = await p.$queryRawUnsafe(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname='public' AND tablename='AuditLog'
    ORDER BY indexname;
  `);

  console.log("\n== AuditLog indexes ==");
  console.table(idx);

  await p.$disconnect();
})().catch(e => { console.error(e); process.exit(1); });
