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

// 2. Fetch the Default/First Board with nested Lists and Cards
const getBoardDetails = async (req, res) => {
  try {
    // For this generic route, we just get the very first board in the database
    // In a real app with multiple boards, we would filter by a user's ID or URL params
    const board = await prisma.board.findFirst({
      include: {
        lists: {
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
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      }
    });

    if (!board) {
      return res.status(200).json({ id: null, title: 'Welcome Board', lists: [] });
    }

    res.status(200).json(board);
  } catch (err) {
    console.error('Error fetching board details:', err);
    res.status(500).json({ error: 'Internal server error while fetching board' });
  }
};

module.exports = {
  createBoard,
  getBoardDetails,
};
