const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();

  const user = await prisma.user.update({
    where: { email: "admin@saas.local" },
    data: { companyId: company.id }
  });

  console.log("Admin vinculado à empresa:");
  console.log(user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
