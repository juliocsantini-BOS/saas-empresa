const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();

  // pega um user qualquer pra ter um id válido
  const u = await prisma.user.findFirst({ select: { id: true, email: true, companyId: true } });
  console.log("User alvo:", u);

  try {
    // ❌ update SEM companyId no where => deve cair no fail-safe
    await prisma.user.update({
      where: { id: u.id },
      data: { name: "HACKED_NO_TENANT" },
    });
    console.log("❌ ERRO: update passou (não era pra passar)");
  } catch (e) {
    console.log("✅ OK: bloqueou update sem companyId");
    console.log(String(e.message || e));
  } finally {
    await prisma.$disconnect();
  }
})();
