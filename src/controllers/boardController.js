const prisma = require('../config/db');

// 1. Create a Board
const createBoard = async (req, res) => {
  try {
    const { title, description, ownerId } = req.body;

    if (!title || !ownerId) {
      return res.status(400).json({ error: 'Title and ownerId are required' });
    }

    const board = await prisma.board.create({
      data: {
        title,
        description,
        ownerId,
      },
    });

    res.status(201).json(board);
  } catch (err) {
    console.error('Error creating board:', err);
    res.status(500).json({ error: 'Internal server error while creating board' });
  }
};

// 2. Fetch a Single Board with nested Lists and Cards ordered by position
const getBoardDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        lists: {
          orderBy: {
            position: 'asc',
          },
          include: {
            cards: {
              where: {
                isArchived: false, // Optionally filter out archived cards by default
              },
              orderBy: {
                position: 'asc',
              },
            },
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (err) {
    console.error('Error fetching board details:', err);
    res.status(500).json({ error: 'Internal server error while fetching board' });
  }
};

module.exports = {
  createBoard,
  getBoardDetails,
};
