const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcrypt");

(async () => {
  const prisma = new PrismaClient();

  const email = "user2@teste.com";
  const name = "User Company 2";
  const password = "123456";
  const companyId = "cmmarrzl50028tyuwng44g1jf";

  const exists = await prisma.user.findFirst({ where: { email } });
  if (exists) {
    console.log("USER já existe:", exists.id, "companyId=", exists.companyId);
    await prisma.$disconnect();
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  const u = await prisma.user.create({
    data: {
      email,
      name,
      password: hash,
      role: Role.USER,
      isActive: true,
      companyId,
    },
    select: { id: true, email: true, role: true, companyId: true },
  });

  console.log("USER criado:", u);
  await prisma.$disconnect();
})().catch((e) => {
  console.error("SEED ERROR:", e);
  process.exit(1);
});
