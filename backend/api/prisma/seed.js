require("dotenv").config();

const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcrypt");

const adapterPkg = require("@prisma/adapter-pg");
const PrismaPgCtor = adapterPkg.PrismaPg || adapterPkg.PrismaPgAdapter;

if (!PrismaPgCtor) {
  console.error(
    "Não achei PrismaPg/PrismaPgAdapter em @prisma/adapter-pg. Exports:",
    Object.keys(adapterPkg)
  );
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL não encontrado no .env");
  process.exit(1);
}

const adapter = new PrismaPgCtor({ connectionString });
const prisma = new PrismaClient({ adapter });

const PERMS = [
  "company.create",
  "company.read",
  "company.update",
  "company.delete",

  "branches.create",
  "branches.read",
  "branches.update",
  "branches.delete",

  "departments.create",
  "departments.read",
  "departments.update",
  "departments.delete",

  "users.create",
  "users.read",
  "users.update",
  "users.disable",
  "users.enable",
  "users.reset_password",

  "rbac.permissions.read",
  "rbac.roles.read",
  "rbac.roles.update",
  "rbac.user_permissions.read",
  "rbac.user_permissions.allow",
  "rbac.user_permissions.deny",
  "rbac.user_permissions.revoke",

  "audit.read",
  "audit.export",
];

function permsForRole(role) {
  if (role === Role.ADMIN_MASTER) return PERMS.slice();

  if (role === Role.ADMIN) {
    return PERMS.filter((p) => p !== "audit.export");
  }

  if (role === Role.CEO) {
    return [
      "company.read",
      "company.update",

      "branches.create",
      "branches.read",
      "branches.update",
      "branches.delete",

      "departments.create",
      "departments.read",
      "departments.update",
      "departments.delete",

      "users.create",
      "users.read",
      "users.update",
      "users.disable",
      "users.enable",

      "audit.read",
      "rbac.permissions.read",
      "rbac.roles.read",
      "rbac.user_permissions.read",
    ];
  }

  if (role === Role.CFO || role === Role.FINANCE) {
    return [
      "company.read",
      "branches.read",
      "departments.read",
      "users.read",
      "audit.read",
    ];
  }

  if (role === Role.SUPPORT) {
    return [
      "branches.read",
      "departments.read",
      "users.read",
      "audit.read",
    ];
  }

  return [
    "company.read",
    "branches.read",
    "departments.read",
    "users.read",
  ];
}

async function upsertPermissions() {
  for (const key of PERMS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: {
        key,
        description: key,
      },
    });
  }
  console.log(`✅ Permissions upsert: ${PERMS.length}`);
}

async function seedRolePermissions() {
  const allPerms = await prisma.permission.findMany({
    select: { id: true, key: true },
  });

  const permIdByKey = Object.fromEntries(allPerms.map((p) => [p.key, p.id]));
  const roles = Object.values(Role);

  let totalLinks = 0;

  for (const role of roles) {
    const wanted = permsForRole(role);

    const data = wanted
      .filter((k) => permIdByKey[k])
      .map((k) => ({
        role,
        permissionId: permIdByKey[k],
      }));

    if (data.length) {
      const res = await prisma.rolePermission.createMany({
        data,
        skipDuplicates: true,
      });
      totalLinks += res.count ?? 0;
    }
  }

  console.log(`✅ RolePermission createMany: +${totalLinks}`);
}

async function ensureAdminMaster() {
  const email = (process.env.ADMIN_MASTER_EMAIL || "admin@saas.local")
    .trim()
    .toLowerCase();

  const name = (process.env.ADMIN_MASTER_NAME || "Admin Master").trim();
  const plain = process.env.ADMIN_MASTER_PASSWORD || "Admin@123456";
  const passwordHash = await bcrypt.hash(plain, 10);

  const existing = await prisma.user.findFirst({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (existing) {
    if (existing.role !== Role.ADMIN_MASTER) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: Role.ADMIN_MASTER },
      });
    }
    console.log("✅ ADMIN_MASTER já existe:", existing.email, existing.id);
    return;
  }

  const created = await prisma.user.create({
    data: {
      email,
      name,
      password: passwordHash,
      role: Role.ADMIN_MASTER,
      isActive: true,
    },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  console.log("✅ ADMIN_MASTER criado:", created);
}

async function main() {
  console.log("🌱 Iniciando seed...");

  await ensureAdminMaster();
  await upsertPermissions();
  await seedRolePermissions();

  console.log("✅ Seed RBAC finalizado (admin + permissions + rolePermissions)");
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
