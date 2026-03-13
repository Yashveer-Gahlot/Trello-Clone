const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const list = await prisma.list.findFirst();
    const card = await prisma.card.create({
      data: {
        listId: list.id,
        title: "Test Card 2",
        description: '',
        position: 1024,
      },
      include: {
        cardLabels: { include: { label: true } },
        cardMembers: { include: { user: true } },
        checklists: { include: { items: true } },
        attachments: true,
      }
    });
    console.log('SUCCESS:', card);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
