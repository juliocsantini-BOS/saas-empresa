const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();

  const u = await prisma.user.findFirst({ select: { id: true, email: true, companyId: true } });
  console.log("User alvo:", u);

  const updated = await prisma.user.update({
    where: { id: u.id, companyId: u.companyId },
    data: { name: "OK_WITH_TENANT" },
    select: { id: true, name: true, companyId: true }
  });

  console.log("✅ OK: update com tenant passou:", updated);
  await prisma.$disconnect();
})();
