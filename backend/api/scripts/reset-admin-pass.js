const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@suaplataforma.com";
  const newPass = process.argv[3] || "123456";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("[ERRO] Usuário não encontrado:", email);
    process.exit(1);
  }

  const hash = await bcrypt.hash(newPass, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hash },
  });

  console.log("[OK] Senha resetada:", email, "->", newPass);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
