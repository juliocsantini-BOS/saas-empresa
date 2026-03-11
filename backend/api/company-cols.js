require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
(async () => {
  const p = new PrismaClient();
  const sql = `
    select column_name, data_type, is_nullable
    from information_schema.columns
    where table_schema='public' and table_name='Company'
    order by ordinal_position
  `;
  const rows = await p.$queryRawUnsafe(sql);
  console.log("== COLUMNS: Company ==");
  console.table(rows);
  await p.$disconnect();
})().catch(e=>{console.error(e);process.exit(1)});
