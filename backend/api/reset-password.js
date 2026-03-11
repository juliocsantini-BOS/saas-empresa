const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

(async () => {
  const hash = bcrypt.hashSync("NovaSenhaForte#2026", 10);

  await prisma.user.update({
    where: { id: "cmldap2fl000020tye5lmub1x" },
    data: { password: hash }
  });

  console.log("OK senha atualizada");
  await prisma.$disconnect();
})();
