const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { fullCardInclude } = require('./src/controllers/boardController');
async function main() {
  try {
    const list = await prisma.list.findFirst();
    const card = await prisma.card.create({
      data: {
        listId: list.id,
        title: "Test FullCardInclude",
        position: 2048,
      },
      include: fullCardInclude
    });
    console.log('SUCCESS:', card);
  } catch (err) {
    console.error('ERROR_CAUGHT:', err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
