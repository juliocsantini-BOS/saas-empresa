const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

function prismaUserFields() {
  const m = Prisma?.dmmf?.datamodel?.models?.find(x => x.name === "User");
  if (!m) return [];
  return m.fields.map(f => f.name);
}

(async () => {
  const dbCols = await prisma.$queryRawUnsafe(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='User'
    ORDER BY ordinal_position
  `);

  const dbSet = new Set(dbCols.map(x => x.column_name));
  const prismaFields = prismaUserFields();

  const missingInDb = prismaFields.filter(f => !dbSet.has(f));
  const extraInDb = [...dbSet].filter(c => !prismaFields.includes(c));

  console.log("=== USER DIFF ===");
  console.log("Missing in DB (exists in Prisma schema):", missingInDb);
  console.log("Extra in DB (exists in DB, not in Prisma schema):", extraInDb);

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  try { await prisma.$disconnect(); } catch {}
  process.exit(1);
});
