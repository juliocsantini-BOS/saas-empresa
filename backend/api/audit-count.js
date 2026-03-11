const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  try {
    const count = await prisma.auditLog.count();
    console.log("AUDITLOG COUNT =", count);

    const last = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    console.log("LAST 3 =", last);
  } catch (e) {
    console.error("ERRO:", e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
