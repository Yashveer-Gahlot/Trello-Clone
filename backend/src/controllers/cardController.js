const prisma = require('../config/db');
const { fullCardInclude } = require('./boardController');

// 1. Create a Card
const createCard = async (req, res) => {
  try {
    const { listId, title, description, position, dueDate, reminderDate } = req.body;
    const userId = req.user?.id;

    if (!listId || !title) {
      return res.status(400).json({ error: 'listId and title are required' });
    }

    // Auto-calculate position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const lastCard = await prisma.card.findFirst({
        where: { listId },
        orderBy: { position: 'desc' },
      });
      finalPosition = lastCard ? lastCard.position + 1024 : 1024;
    }

    const card = await prisma.card.create({
      data: {
        listId,
        title,
        description: description || '',
        position: finalPosition,
      },
      include: {
        cardLabels: { include: { label: true } },
        cardMembers: { include: { user: true } },
        checklists: { include: { items: true } },
        attachments: true,
        activities: { orderBy: { createdAt: 'desc' }, include: { user: true } },
      }
    });

    if (userId) {
      // Find the boardId via the list to attach to the activity
      const list = await prisma.list.findUnique({ where: { id: listId } });
      if (list) {
        await prisma.activity.create({
          data: {
            boardId: list.boardId,
            cardId: card.id,
            userId,
            actionType: 'created',
          }
        });
        // Refetch to include the new activity
        const updatedCard = await prisma.card.findUnique({ where: { id: card.id }, include: fullCardInclude });
        return res.status(201).json(updatedCard);
      }
    }

    res.status(201).json(card);
  } catch (err) {
    console.error('BACKEND_CRASH_LOG:', err);
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid listId provided' });
    }
    res.status(500).json({ error: 'Internal server error while creating card' });
  }
};

// 2. Move a Card (Drag and Drop)
const moveCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, listId } = req.body;

    if (position === undefined) {
      return res.status(400).json({ error: 'position is required' });
    }

    const updateData = { position };
    if (listId) {
      updateData.listId = listId;
    }

    const card = await prisma.card.update({
      where: { id },
      data: updateData,
    });

    res.json(card);
  } catch (err) {
    console.error('Error moving card:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid listId provided' });
    }
    res.status(500).json({ error: 'Internal server error while moving card' });
  }
};

const getCards = async (req, res) => {
  try {
    const cards = await prisma.card.findMany();
    res.status(200).json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

// 4. Delete a Card
const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.card.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Error deleting card:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(500).json({ error: 'Internal server error while deleting card' });
  }
};

// 5. Update Card Details (title, description, dueDate)
const updateCardDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    const userId = req.user?.id;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'At least one field (title, description, or dueDate) is required' });
    }

    const card = await prisma.card.update({
      where: { id },
      data: updateData,
      include: fullCardInclude,
    });

    if (userId) {
      if (title !== undefined) {
        await prisma.activity.create({
          data: { boardId: card.list.boardId, cardId: id, userId, actionType: 'updated_title', actionDetails: { title } }
        });
      }
      if (description !== undefined) {
        await prisma.activity.create({
          data: { boardId: card.list.boardId, cardId: id, userId, actionType: 'updated_description' }
        });
      }
      if (dueDate !== undefined) {
        await prisma.activity.create({
          data: { boardId: card.list.boardId, cardId: id, userId, actionType: 'updated_due_date', actionDetails: { dueDate } }
        });
      }
      const updatedCard = await prisma.card.findUnique({ where: { id }, include: fullCardInclude });
      return res.status(200).json(updatedCard);
    }

    res.status(200).json(card);
  } catch (err) {
    console.error('Error updating card details:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(500).json({ error: 'Internal server error while updating card' });
  }
};

// 6. Archive a Card
const archiveCard = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.card.update({ where: { id }, data: { isArchived: true } });
    res.status(200).json({ message: 'Card archived successfully' });
  } catch (err) {
    console.error('Error archiving card:', err);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Card not found' });
    res.status(500).json({ error: 'Internal server error while archiving card' });
  }
};

module.exports = {
  createCard,
  moveCard,
  getCards,
  deleteCard,
  updateCardDetails,
  archiveCard,
};
