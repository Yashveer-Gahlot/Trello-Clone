const prisma = require('../config/db');

// Shared include object for returning full card data
const fullCardInclude = {
  cardLabels: { include: { label: true } },
  cardMembers: {
    include: {
      user: { select: { id: true, username: true, email: true } },
    },
  },
  checklists: {
    orderBy: { position: 'asc' },
    include: {
      items: { orderBy: { position: 'asc' } },
    },
  },
  attachments: true,
  activities: {
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  },
};

// 1. Get all boards (lightweight listing)
const getAllBoards = async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      select: { id: true, title: true, description: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json(boards);
  } catch (err) {
    console.error('Error fetching boards:', err);
    res.status(500).json({ error: 'Internal server error while fetching boards' });
  }
};

// 2. Create a Board
const createBoard = async (req, res) => {
  try {
    const { title, description, ownerId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // If no ownerId provided, use the first user as default owner
    let finalOwnerId = ownerId;
    if (!finalOwnerId) {
      const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
      if (!firstUser) return res.status(400).json({ error: 'No users exist to own this board' });
      finalOwnerId = firstUser.id;
    }

    const board = await prisma.board.create({
      data: {
        title,
        description,
        ownerId: finalOwnerId,
      },
    });

    res.status(201).json(board);
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ error: 'Internal server error while creating board' });
  }
};

// 3. Fetch a specific Board by ID with nested Lists, Cards, Labels, and Users
const getBoardDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        labels: {
          orderBy: { createdAt: 'asc' },
        },
        lists: {
          where: { isArchived: false },
          orderBy: {
            position: 'asc',
          },
          include: {
            cards: {
              where: {
                isArchived: false,
              },
              orderBy: {
                position: 'asc',
              },
              include: fullCardInclude,
            },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Fetch all users in the system (workspace members)
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true },
      orderBy: { username: 'asc' },
    });

    res.status(200).json({ ...board, users });
  } catch (err) {
    console.error('Error fetching board details:', err);
    res.status(500).json({ error: 'Internal server error while fetching board' });
  }
};

// 4. Delete a Board (cascade deletes lists, cards, etc.)
const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.board.delete({ where: { id } });
    res.status(200).json({ message: 'Board deleted successfully' });
  } catch (err) {
    console.error('Error deleting board:', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Board not found' });
    res.status(500).json({ error: 'Internal server error while deleting board' });
  }
};

// 5. Create a Label for a Board
const createLabel = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, color } = req.body;

    if (!color) return res.status(400).json({ error: 'Label color is required' });

    const label = await prisma.label.create({
      data: { boardId, title, color },
    });

    res.status(201).json(label);
  } catch (err) {
    if (err.code === 'P2003') return res.status(404).json({ error: 'Board not found' });
    console.error('Error creating label:', err);
    res.status(500).json({ error: 'Internal server error while creating label' });
  }
};

module.exports = {
  getAllBoards,
  createBoard,
  getBoardDetails,
  deleteBoard,
  createLabel,
  fullCardInclude,
};
