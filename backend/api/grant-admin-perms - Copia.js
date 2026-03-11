const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: "admin.tenant@empresa-demo.com" }
  });

  if (!admin) {
    throw new Error("Admin tenant não encontrado.");
  }

  const permissionKeys = [
    "departments.read",
    "departments.create",
    "departments.update",
    "departments.delete"
  ];

  for (const key of permissionKeys) {
    let permission = await prisma.permission.findUnique({
      where: { key }
    });

    if (!permission) {
      permission = await prisma.permission.create({
        data: {
          key,
          description: key
        }
      });
    }

    const exists = await prisma.userPermission.findFirst({
      where: {
        companyId: admin.companyId,
        userId: admin.id,
        permissionId: permission.id
      }
    });

    if (!exists) {
      await prisma.userPermission.create({
        data: {
          companyId: admin.companyId,
          userId: admin.id,
          permissionId: permission.id,
          effect: "ALLOW"
        }
      });
    }
  }

  console.log("Permissões adicionadas ao ADMIN com sucesso.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
