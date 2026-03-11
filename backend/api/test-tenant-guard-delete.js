const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();

  const u = await prisma.user.findFirst({ select: { id: true, email: true, companyId: true } });
  console.log("User alvo:", u);

  try {
    // ❌ delete SEM companyId no where => deve cair no fail-safe
    await prisma.user.delete({ where: { id: u.id } });
    console.log("❌ ERRO: delete passou (não era pra passar)");
  } catch (e) {
    console.log("✅ OK: bloqueou delete sem companyId");
    console.log(String(e.message || e));
  } finally {
    await prisma.$disconnect();
  }
})();
