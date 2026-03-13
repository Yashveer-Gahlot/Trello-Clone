const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clear all existing data (order matters for FK constraints)
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

  // 2. Create Users
  const alice = await prisma.user.create({
    data: { username: 'alice', email: 'alice@example.com', passwordHash: 'hashed_pw_1' },
  });
  const bob = await prisma.user.create({
    data: { username: 'bob', email: 'bob@example.com', passwordHash: 'hashed_pw_2' },
  });
  const charlie = await prisma.user.create({
    data: { username: 'charlie', email: 'charlie@example.com', passwordHash: 'hashed_pw_3' },
  });
  console.log('Created Users.');

  // 3. Create Board
  const board = await prisma.board.create({
    data: {
      title: 'Project Alpha Tracker',
      description: 'Main board for project alpha tasks',
      ownerId: alice.id,
    },
  });
  console.log('Created Board.');

  // 4. Create Lists
  const listTodo = await prisma.list.create({
    data: { title: 'To Do', position: 65535.0, boardId: board.id },
  });
  const listInProgress = await prisma.list.create({
    data: { title: 'In Progress', position: 131070.0, boardId: board.id },
  });
  const listDone = await prisma.list.create({
    data: { title: 'Done', position: 196605.0, boardId: board.id },
  });
  console.log('Created Lists.');

  // 5. Create Labels
  const labelBackend = await prisma.label.create({
    data: { title: 'Backend', color: '#0079bf', boardId: board.id },
  });
  const labelCritical = await prisma.label.create({
    data: { title: 'Critical', color: '#eb5a46', boardId: board.id },
  });
  const labelDone = await prisma.label.create({
    data: { title: 'Done', color: '#61bd4f', boardId: board.id },
  });
  const labelFrontend = await prisma.label.create({
    data: { title: 'Frontend', color: '#c084fc', boardId: board.id },
  });
  console.log('Created Labels.');

  // 6. Create Cards with nested relations
  // Card 1: "Setup Database" — has labels, members, checklists, file attachment, and link attachment
  const card1 = await prisma.card.create({
    data: {
      title: 'Setup Database',
      description: 'Configure PostgreSQL with Prisma ORM',
      position: 65535.0,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      listId: listTodo.id,
      cardLabels: {
        create: [
          { labelId: labelBackend.id },
          { labelId: labelCritical.id },
        ],
      },
      cardMembers: {
        create: [
          { userId: alice.id },
          { userId: bob.id },
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
        create: [
          {
            fileName: 'schema_draft.pdf',
            fileUrl: '/uploads/schema_draft.pdf',
            fileType: 'file',
            fileSize: 1048576,
            userId: alice.id,
          },
          {
            fileName: 'Prisma Docs',
            fileUrl: 'https://www.prisma.io/docs',
            fileType: 'link',
            userId: alice.id,
          },
        ],
      },
    },
  });

  // Card 2: "Create Seed Script"
  const card2 = await prisma.card.create({
    data: {
      title: 'Create Seed Script',
      description: 'Write a Node.js seed script using Prisma Client',
      position: 131070.0,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      listId: listTodo.id,
      cardLabels: {
        create: [{ labelId: labelBackend.id }],
      },
      cardMembers: {
        create: [{ userId: alice.id }],
      },
    },
  });

  // Card 3: "Implement Auth"
  const card3 = await prisma.card.create({
    data: {
      title: 'Implement Auth',
      description: 'JWT authentication and middleware',
      position: 65535.0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      listId: listInProgress.id,
      cardLabels: {
        create: [{ labelId: labelBackend.id }],
      },
      cardMembers: {
        create: [{ userId: charlie.id }],
      },
      attachments: {
        create: {
          fileName: 'JWT Guide',
          fileUrl: 'https://jwt.io/introduction',
          fileType: 'link',
          userId: charlie.id,
        },
      },
    },
  });

  // Card 4: "Initialize Project" — in Done
  const card4 = await prisma.card.create({
    data: {
      title: 'Initialize Project',
      description: 'npm init, express setup',
      position: 65535.0,
      listId: listDone.id,
      cardLabels: {
        create: [{ labelId: labelDone.id }],
      },
    },
  });

  // Card 5: Archived card
  const card5 = await prisma.card.create({
    data: {
      title: 'Old Archived Idea',
      description: 'We decided not to do this',
      position: 131070.0,
      isArchived: true,
      listId: listDone.id,
    },
  });
  console.log('Created Cards with Labels, Members, Checklists, and Attachments.');

  // 7. Comments
  await prisma.comment.createMany({
    data: [
      { cardId: card1.id, userId: alice.id, content: 'I will take care of the schema design.' },
      { cardId: card1.id, userId: bob.id, content: 'Great, let me know when it is done.' },
    ],
  });
  console.log('Created Comments.');

  // 8. Activity logs — action types match the controllers & frontend formatActivityTarget()
  await prisma.activity.createMany({
    data: [
      {
        boardId: board.id,
        userId: alice.id,
        cardId: card1.id,
        actionType: 'created',
      },
      {
        boardId: board.id,
        userId: alice.id,
        cardId: card2.id,
        actionType: 'created',
      },
      {
        boardId: board.id,
        userId: alice.id,
        cardId: card1.id,
        actionType: 'added_attachment',
        actionDetails: { fileName: 'schema_draft.pdf', type: 'file' },
      },
      {
        boardId: board.id,
        userId: alice.id,
        cardId: card1.id,
        actionType: 'added_attachment',
        actionDetails: { fileName: 'Prisma Docs', type: 'link' },
      },
      {
        boardId: board.id,
        userId: alice.id,
        cardId: card1.id,
        actionType: 'added_label',
        actionDetails: { labelId: labelBackend.id },
      },
      {
        boardId: board.id,
        userId: alice.id,
        cardId: card1.id,
        actionType: 'added_member',
        actionDetails: { addedUserId: bob.id },
      },
      {
        boardId: board.id,
        userId: charlie.id,
        cardId: card3.id,
        actionType: 'created',
      },
      {
        boardId: board.id,
        userId: charlie.id,
        cardId: card3.id,
        actionType: 'added_attachment',
        actionDetails: { fileName: 'JWT Guide', type: 'link' },
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
