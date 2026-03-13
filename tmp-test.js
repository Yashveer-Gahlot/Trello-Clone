const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const card = await prisma.card.findFirst({ include: { list: true }});
  
  if (!card) return console.log('No card found');

  const label = await prisma.label.findFirst({ where: { boardId: card.list.boardId } });
  
  if (!label) {
    console.log('No label found for this board!');
    return;
  }
  
  try {
    console.log(`Toggling label ${label.id} on card ${card.id}...`);
    const response = await fetch(`http://localhost:3000/api/cards/${card.id}/labels/${label.id}/toggle`, {
      method: 'POST'
    });
    const data = await response.json();
    
    console.log('Response has activities property?', 'activities' in data);
    if ('activities' in data) {
        console.log('Activities count:', data.activities?.length ?? 'null');
    } else {
        console.log('Instead, response keys are:', Object.keys(data));
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
