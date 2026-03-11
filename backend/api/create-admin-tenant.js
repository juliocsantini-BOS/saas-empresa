const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getHasher() {
  try {
    const bcryptjs = require("bcryptjs");
    return {
      hash: async (value) => bcryptjs.hash(value, 10),
      name: "bcryptjs",
    };
  } catch {}

  try {
    const bcrypt = require("bcrypt");
    return {
      hash: async (value) => bcrypt.hash(value, 10),
      name: "bcrypt",
    };
  } catch {}

  throw new Error("Nem bcryptjs nem bcrypt estão instalados no backend.");
}

async function main() {
  const COMPANY_NAME = "Empresa Demo Admin";
  const BRANCH_NAME = "Matriz";
  const ADMIN_NAME = "Admin Tenant";
  const ADMIN_EMAIL = "admin.tenant@empresa-demo.com";
  const ADMIN_PASSWORD = "Admin@123456";

  const hasher = await getHasher();

  let company = await prisma.company.findFirst({
    where: { name: COMPANY_NAME },
  });

  if (!company) {
    company = await prisma.company.create({
      data: { name: COMPANY_NAME },
    });
  }

  let branch = await prisma.branch.findFirst({
    where: {
      companyId: company.id,
      name: BRANCH_NAME,
    },
  });

  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: BRANCH_NAME,
        companyId: company.id,
      },
    });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      companyId: company.id,
      email: ADMIN_EMAIL,
    },
  });

  const passwordHash = await hasher.hash(ADMIN_PASSWORD);

  let user;

  if (existingUser) {
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: ADMIN_NAME,
        password: passwordHash,
        role: "ADMIN",
        isActive: true,
        companyId: company.id,
        branchId: branch.id,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: "ADMIN",
        isActive: true,
        companyId: company.id,
        branchId: branch.id,
      },
    });
  }

  console.log("\n=== COMPANY ===");
  console.log(JSON.stringify(company, null, 2));

  console.log("\n=== BRANCH ===");
  console.log(JSON.stringify(branch, null, 2));

  console.log("\n=== ADMIN TENANT ===");
  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    branchId: user.branchId,
    isActive: user.isActive,
  }, null, 2));

  console.log("\n=== LOGIN ===");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Senha: ${ADMIN_PASSWORD}`);
  console.log(`Hash provider: ${hasher.name}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
