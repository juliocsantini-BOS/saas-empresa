require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();

  async function cols(table) {
    const sql = `
      select column_name, data_type, is_nullable
      from information_schema.columns
      where table_schema='public' and table_name=$1
      order by ordinal_position
    `;
    const rows = await p.$queryRawUnsafe(sql, table);
    console.log("\n== COLUMNS:", table, "==");
    console.table(rows);
  }

  await cols("Company");
  await cols("User");
  await cols("Branch");

  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
