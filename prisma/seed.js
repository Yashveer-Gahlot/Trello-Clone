const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Delete all existing records to prevent duplicates.
  // Due to onDelete: Cascade, deleting Boards and Users will handle most child records,
  // but it's safe to clear top-level entities to ensure a clean slate.
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.label.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared existing data.');

  // 2. Create 3 sample Users
  const user1 = await prisma.user.create({
    data: { username: 'alice', email: 'alice@example.com', passwordHash: 'hashed_pw_1' },
  });
  const user2 = await prisma.user.create({
    data: { username: 'bob', email: 'bob@example.com', passwordHash: 'hashed_pw_2' },
  });
  const user3 = await prisma.user.create({
    data: { username: 'charlie', email: 'charlie@example.com', passwordHash: 'hashed_pw_3' },
  });
  console.log('Created Users.');

  // 3. Create 1 Board
  const board = await prisma.board.create({
    data: {
      title: 'Project Alpha Tracker',
      description: 'Main board for project alpha tasks',
      ownerId: user1.id,
    },
  });
  console.log('Created Board.');

  // 4. Create 3 Lists with incrementing Float positions
  const list1 = await prisma.list.create({
    data: { title: 'To Do', position: 65535.0, boardId: board.id },
  });
  const list2 = await prisma.list.create({
    data: { title: 'In Progress', position: 131070.0, boardId: board.id },
  });
  const list3 = await prisma.list.create({
    data: { title: 'Done', position: 196605.0, boardId: board.id },
  });
  console.log('Created Lists.');

  // 5. Create Sample Labels
  const labelBackend = await prisma.label.create({
    data: { title: 'Backend', color: '#0079bf', boardId: board.id },
  });
  const labelCritical = await prisma.label.create({
    data: { title: 'Critical', color: '#eb5a46', boardId: board.id },
  });
  const labelDone = await prisma.label.create({
    data: { title: 'Done', color: '#61bd4f', boardId: board.id },
  });
  console.log('Created Labels.');

  // 6. Create 5 Cards distributed across Lists (1 archived)
  // We use nested writes to create CardMember, CardLabel, Checklist, and Attachments in one go!
  const card1 = await prisma.card.create({
    data: {
      title: 'Setup Database',
      description: 'Configure PostgreSQL with Prisma ORM',
      position: 65535.0,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
      listId: list1.id,
      cardLabels: {
        create: [
          { labelId: labelBackend.id },
          { labelId: labelCritical.id },
        ],
      },
      cardMembers: {
        create: [
          { userId: user1.id },
          { userId: user2.id },
        ],
      },
      checklists: {
        create: {
          title: 'Requirements',
          position: 65535.0,
          items: {
            create: [
              { content: 'Install Prisma', isCompleted: true, position: 1000.0 },
              { content: 'Write schema.prisma', isCompleted: true, position: 2000.0 },
              { content: 'Write seed script', isCompleted: false, position: 3000.0 },
            ],
          },
        },
      },
      attachments: {
        create: {
          fileUrl: 'https://example.com/uploads/schema_draft.pdf',
          fileName: 'schema_draft.pdf',
          fileType: 'application/pdf',
          fileSize: 1048576,
          userId: user1.id,
        },
      },
    },
  });

  const card2 = await prisma.card.create({
    data: {
      title: 'Create Seed Script',
      description: 'Write a Node.js seed script using Prisma Client',
      position: 131070.0,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      listId: list1.id,
      cardLabels: {
        create: [{ labelId: labelBackend.id }],
      },
      cardMembers: {
        create: [{ userId: user1.id }],
      },
    },
  });

  const card3 = await prisma.card.create({
    data: {
      title: 'Implement Auth',
      description: 'JWT authentication and middleware',
      position: 65535.0,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      listId: list2.id,
      cardLabels: {
        create: [{ labelId: labelBackend.id }],
      },
      cardMembers: {
        create: [{ userId: user3.id }],
      },
    },
  });

  const card4 = await prisma.card.create({
    data: {
      title: 'Initialize Project',
      description: 'npm init, express setup',
      position: 65535.0,
      listId: list3.id,
      cardLabels: {
        create: [{ labelId: labelDone.id }],
      },
    },
  });

  const card5 = await prisma.card.create({
    data: {
      title: 'Old Archived Idea',
      description: 'We decided not to do this',
      position: 131070.0,
      isArchived: true,
      listId: list3.id,
    },
  });
  console.log('Created Cards with Labels, Members, Checklists, and Attachments.');

  // 7. Add Comments to Card 1
  await prisma.comment.createMany({
    data: [
      { cardId: card1.id, userId: user1.id, content: 'I will take care of the schema design.' },
      { cardId: card1.id, userId: user2.id, content: 'Great, let me know when it is done.' },
    ],
  });
  console.log('Created Comments.');

  // 8. Generate Activity logs
  await prisma.activity.createMany({
    data: [
      {
        boardId: board.id,
        userId: user1.id,
        cardId: card1.id,
        actionType: 'CREATED_CARD',
        actionDetails: { cardTitle: 'Setup Database' },
      },
      {
        boardId: board.id,
        userId: user1.id,
        cardId: card2.id,
        actionType: 'CREATED_CARD',
        actionDetails: { cardTitle: 'Create Seed Script' },
      },
      {
        boardId: board.id,
        userId: user2.id,
        cardId: card1.id,
        actionType: 'ADDED_COMMENT',
        actionDetails: { commentSnippet: 'Great, let me know...' },
      },
    ],
  });
  console.log('Created Activity logs.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
