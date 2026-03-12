const prisma = require('../config/db');

// 1. Create a List
const createList = async (req, res) => {
  try {
    const { boardId, title, position } = req.body;

    if (!boardId || !title) {
      return res.status(400).json({ error: 'boardId and title are required' });
    }

    // Auto-calculate position if not provided: find the highest position on this board and add 1024
    let finalPosition = position;
    if (finalPosition === undefined) {
      const lastList = await prisma.list.findFirst({
        where: { boardId },
        orderBy: { position: 'desc' },
      });
      finalPosition = lastList ? lastList.position + 1024 : 1024;
    }

    const list = await prisma.list.create({
      data: {
        boardId,
        title,
        position: finalPosition,
      },
    });

    res.status(201).json(list);
  } catch (err) {
    console.error('Error creating list:', err);
    
    // Handle Prisma specific foreign key errors
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid boardId provided' });
    }

    res.status(500).json({ error: 'Internal server error while creating list' });
  }
};

// 2. Update a List's Position (e.g. for drag and drop)
const updateListPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;

    if (position === undefined) {
      return res.status(400).json({ error: 'position is required' });
    }

    const list = await prisma.list.update({
      where: { id },
      data: { position },
    });

    res.json(list);
  } catch (err) {
    console.error('Error updating list position:', err);
    
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'List not found' });
    }

    res.status(500).json({ error: 'Internal server error while updating list' });
  }
};

// 3. Delete a List
const deleteList = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.list.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting list:', err);

    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'List not found' });
    }

    res.status(500).json({ error: 'Internal server error while deleting list' });
  }
};

// 4. Move a List (Drag and Drop)
const moveList = async (req, res) => {
  try {
    const { id } = req.params;
    const { position } = req.body;

    if (position === undefined) {
      return res.status(400).json({ error: 'position is required' });
    }

    const list = await prisma.list.update({
      where: { id },
      data: { position },
    });

    res.status(200).json(list);
  } catch (err) {
    console.error('Error moving list:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'List not found' });
    }
    res.status(500).json({ error: 'Internal server error while moving list' });
  }
};

module.exports = {
  createList,
  updateListPosition,
  deleteList,
  moveList,
};
