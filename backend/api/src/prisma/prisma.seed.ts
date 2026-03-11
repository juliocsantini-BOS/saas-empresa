const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

const PERMS = [
  "COMPANY:CREATE","COMPANY:READ","COMPANY:UPDATE","COMPANY:DELETE",
  "BRANCH:CREATE","BRANCH:READ","BRANCH:UPDATE","BRANCH:DELETE",
  "USER:CREATE","USER:READ","USER:UPDATE","USER:DELETE","USER:ACTIVATE","USER:DEACTIVATE","USER:RESET_PASSWORD",
  "RBAC:ROLE:CREATE","RBAC:ROLE:READ","RBAC:ROLE:UPDATE","RBAC:ROLE:DELETE",
  "RBAC:PERMISSION:READ",
  "RBAC:ASSIGN:ROLE_TO_USER","RBAC:REVOKE:ROLE_FROM_USER",
  "RBAC:ASSIGN:PERM_TO_ROLE","RBAC:REVOKE:PERM_FROM_ROLE",
  "AUTH:TOKEN:REVOKE","AUTH:SESSION:READ",
  "FINANCE:READ","FINANCE:WRITE","FINANCE:APPROVE","FINANCE:EXPORT",
  "SALES:READ","SALES:WRITE","SALES:APPROVE","SALES:EXPORT",
  "SUPPORT:READ","SUPPORT:WRITE","SUPPORT:ASSIGN","SUPPORT:CLOSE",
  "INVENTORY:READ","INVENTORY:WRITE","INVENTORY:ADJUST","INVENTORY:EXPORT",
  "DOC:READ","DOC:WRITE","DOC:DELETE","DOC:EXPORT",
  "REPORT:READ","REPORT:EXPORT",
  "INTEGRATION:READ","INTEGRATION:WRITE",
  "WEBHOOK:READ","WEBHOOK:WRITE",
  "AUDIT:READ","AUDIT:EXPORT",
];

function permsForRole(code) {
  if (code === "ADMIN_MASTER") return PERMS.slice();

  if (code === "ADMIN") return PERMS.filter(p => p !== "AUDIT:EXPORT");

  if (code === "CEO") {
    return PERMS.filter(p =>
      ["COMPANY:","BRANCH:","REPORT:","AUDIT:READ","FINANCE:READ","SALES:READ","USER:READ","RBAC:ROLE:READ","RBAC:PERMISSION:READ"]
        .some(prefix => p.startsWith(prefix))
    );
  }

  if (code === "CFO") {
    return PERMS.filter(p =>
      ["FINANCE:","REPORT:","AUDIT:READ","DOC:READ","DOC:EXPORT"].some(prefix => p.startsWith(prefix))
    );
  }

  if (code === "CMO") {
    return PERMS.filter(p =>
      ["SALES:READ","REPORT:","INTEGRATION:READ"].some(prefix => p.startsWith(prefix))
    );
  }

  if (code === "SALES") {
    return PERMS.filter(p => ["SALES:","REPORT:READ"].some(prefix => p.startsWith(prefix)));
  }

  if (code === "FINANCE") {
    return PERMS.filter(p => ["FINANCE:","REPORT:READ","DOC:READ"].some(prefix => p.startsWith(prefix)));
  }

  if (code === "SUPPORT") {
    return PERMS.filter(p => ["SUPPORT:","USER:READ","DOC:READ"].some(prefix => p.startsWith(prefix)));
  }

  return ["COMPANY:READ","BRANCH:READ","USER:READ","DOC:READ","REPORT:READ"];
}

async function main() {
  // 1) Permissions
  for (const key of PERMS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  const allPerms = await prisma.permission.findMany({ select: { id: true, key: true } });
  const permIdByKey = Object.fromEntries(allPerms.map(p => [p.key, p.id]));

  // 2) RolePermission (role enum + permissionId)
  const roles = Object.values(Role);

  for (const role of roles) {
    const wanted = permsForRole(role);

    await prisma.rolePermission.createMany({
      data: wanted
        .filter(k => permIdByKey[k])
        .map(k => ({ role, permissionId: permIdByKey[k] })),
      skipDuplicates: true,
    });
  }

  console.log("✅ Seed RBAC finalizado (permissions + rolePermissions)");
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });