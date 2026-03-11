const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.create({
    data: {
      name: "Empresa Demo"
    }
  });

  console.log("Empresa criada:");
  console.log(company);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
