const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();

  const u = await prisma.user.findFirst({
    select: { id: true, email: true, companyId: true }
  });

  console.log("\nUser alvo:", u);

  // TESTE 1 - UPDATE sem companyId
  try {
    await prisma.user.update({
      where: { id: u.id },
      data: { name: "HACK_NO_TENANT" }
    });
    console.log("❌ TESTE 1 FALHOU: update passou");
  } catch (e) {
    console.log("✅ TESTE 1 OK: bloqueou update sem tenant");
  }

  // TESTE 2 - DELETE sem companyId
  try {
    await prisma.user.delete({
      where: { id: u.id }
    });
    console.log("❌ TESTE 2 FALHOU: delete passou");
  } catch (e) {
    console.log("✅ TESTE 2 OK: bloqueou delete sem tenant");
  }

  // TESTE 3 - UPDATE com companyId correto
  try {
    const updated = await prisma.user.update({
      where: { id: u.id, companyId: u.companyId },
      data: { name: "OK_WITH_TENANT" }
    });
    console.log("✅ TESTE 3 OK: update com tenant passou");
  } catch (e) {
    console.log("❌ TESTE 3 FALHOU: update com tenant deveria passar");
  }

  await prisma.$disconnect();
})();
