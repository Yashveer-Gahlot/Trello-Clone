const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

const initDatabase = async (req, res) => {
  try {
    console.log('Starting initialization and seeding process...');

    // 1. Check if database is already seeded
    const usersCount = await prisma.user.count();
    if (usersCount > 0) {
      return res.status(200).json({ 
        message: 'Database is already initialized and seeded.', 
        recordCount: usersCount 
      });
    }

    console.log('Database empty, proceeding with seed...');

    // 2. Clear (just in case of partial or corrupted state)
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

    // 3. Create Users
    const alice = await prisma.user.create({
      data: { username: 'alice', email: 'alice@example.com', passwordHash: 'hashed_pw_1' },
    });
    const bob = await prisma.user.create({
      data: { username: 'bob', email: 'bob@example.com', passwordHash: 'hashed_pw_2' },
    });
    const charlie = await prisma.user.create({
      data: { username: 'charlie', email: 'charlie@example.com', passwordHash: 'hashed_pw_3' },
    });

    // 4. Create Board
    const board = await prisma.board.create({
      data: {
        title: 'Project Alpha Tracker',
        description: 'Main board for project alpha tasks',
        ownerId: alice.id,
      },
    });

    // 5. Create Lists
    const listTodo = await prisma.list.create({
      data: { title: 'To Do', position: 65535.0, boardId: board.id },
    });
    const listInProgress = await prisma.list.create({
      data: { title: 'In Progress', position: 131070.0, boardId: board.id },
    });
    const listDone = await prisma.list.create({
      data: { title: 'Done', position: 196605.0, boardId: board.id },
    });

    // 6. Create Labels
    const labelBackend = await prisma.label.create({
      data: { title: 'Backend', color: '#0079bf', boardId: board.id },
    });
    const labelCritical = await prisma.label.create({
      data: { title: 'Critical', color: '#eb5a46', boardId: board.id },
    });
    const labelDone = await prisma.label.create({
      data: { title: 'Done', color: '#61bd4f', boardId: board.id },
    });

    // 7. Create Cards
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
          create: [{ userId: alice.id }, { userId: bob.id }],
        },
        checklists: {
          create: {
            title: 'Requirements',
            position: 65535.0,
            items: {
              create: [
                { content: 'Install Prisma', isCompleted: true, position: 1000.0 },
                { content: 'Write schema', isCompleted: true, position: 2000.0 },
              ],
            },
          },
        },
      },
    });

    res.status(200).json({ 
      success: true, 
      message: 'Database successfully initialized and seeded with dummy data!'
    });

  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initialize database.',
      error: error.message 
    });
  }
};

module.exports = { initDatabase };
