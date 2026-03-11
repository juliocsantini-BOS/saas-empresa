require("dotenv/config"); // <-- garante que DATABASE_URL do .env entra no Node também
const path = require("path");

function safeRequire(p) { try { return require(p); } catch { return null; } }

const PrismaMod =
  safeRequire(path.join(process.cwd(), "dist", "prisma", "prisma.service")) ||
  safeRequire("./dist/prisma/prisma.service");

if (!PrismaMod?.PrismaService) {
  console.log("❌ Não achei dist/prisma/prisma.service. Rode: npm run build");
  process.exit(1);
}

const RCMod =
  safeRequire(path.join(process.cwd(), "dist", "common", "request-context", "request-context")) ||
  safeRequire("./dist/common/request-context/request-context") ||
  safeRequire("./src/common/request-context/request-context");

const RequestContext = RCMod?.RequestContext || RCMod?.default || RCMod;
if (!RequestContext?.run) {
  console.log("❌ RequestContext.run não encontrado.");
  console.log("   RC keys:", Object.keys(RequestContext || {}));
  process.exit(1);
}

function maskDbUrl(u) {
  if (!u) return "(null)";
  return u.replace(/\/\/([^:]+):([^@]+)@/,"//$1:***@");
}

(async () => {
  const prisma = new PrismaMod.PrismaService();
  await prisma.$connect();

  console.log("DATABASE_URL =", maskDbUrl(process.env.DATABASE_URL));

  const uniq = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const companyName = "Tenant Test " + uniq;
  const email = `tenant_${uniq}@test.com`;

  console.log("\n1) Criando Company...");
  const company = await prisma.company.create({
    data: { name: companyName },
    select: { id: true, name: true }
  });
  console.log("✅ Company criada:", company);

  console.log("\n2) Confirmando Company no DB via findUnique...");
  const check = await prisma.company.findUnique({
    where: { id: company.id },
    select: { id: true, name: true }
  });
  console.log("Check =", check);

  if (!check) {
    console.log("❌ Company NÃO encontrada logo após criar. Isso é sinal forte de DB/schema diferente.");
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log("\n3) Criando User com ctx (companyId = company.id)...");
  let user = null;
  await RequestContext.run({ companyId: company.id }, async () => {
    user = await prisma.user.create({
      data: { email, name: "BaseUser", password: "123", companyId: company.id },
      select: { id: true, email: true, companyId: true }
    });
  });
  console.log("✅ User criado:", user);

  // TESTE 1: update sem ctx => deve bloquear (se seu fail-safe estiver ativo)
  console.log("\n4) TESTE 1: updateMany sem ctx (deve BLOQUEAR se fail-safe ativo)...");
  try {
    await prisma.user.updateMany({ where: { id: user.id }, data: { name: "HACK_NO_CTX" } });
    console.log("⚠️ TESTE 1: passou (isso significa: seu guard NÃO está bloqueando writes sem ctx)");
  } catch (e) {
    console.log("✅ TESTE 1: bloqueou:", String(e.message || e));
  }

  // TESTE 2: delete sem ctx
  console.log("\n5) TESTE 2: deleteMany sem ctx (deve BLOQUEAR se fail-safe ativo)...");
  try {
    await prisma.user.deleteMany({ where: { id: user.id } });
    console.log("⚠️ TESTE 2: passou (guard NÃO está bloqueando writes sem ctx)");
  } catch (e) {
    console.log("✅ TESTE 2: bloqueou:", String(e.message || e));
  }

  // cleanup com ctx
  console.log("\n6) Cleanup com ctx...");
  await RequestContext.run({ companyId: company.id }, async () => {
    await prisma.user.deleteMany({ where: { id: user.id } });
  });
  await prisma.company.delete({ where: { id: company.id } });

  await prisma.$disconnect();
  console.log("\n✅ Fim.");
})();
