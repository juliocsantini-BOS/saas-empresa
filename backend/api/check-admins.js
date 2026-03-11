const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {

  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN","CEO","ADMIN_MASTER"]
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
      branchId: true,
      departmentId: true,
      isActive: true
    }
  });

  console.log(JSON.stringify(admins, null, 2));

}

main()
.catch(console.error)
.finally(() => prisma.$disconnect());
