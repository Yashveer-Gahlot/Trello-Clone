const prisma = require('../config/db');

// 1. Create a Card
const createCard = async (req, res) => {
  try {
    const { listId, title, description, position, dueDate, reminderDate } = req.body;

    if (!listId || !title) {
      return res.status(400).json({ error: 'listId and title are required' });
    }

    // Auto-calculate position if not provided: find the highest position in the list and add 1024
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
        description,
        position: finalPosition,
        dueDate: dueDate ? new Date(dueDate) : null,
        reminderDate: reminderDate ? new Date(reminderDate) : null,
      },
    });

    res.status(201).json(card);
  } catch (err) {
    console.error('Error creating card:', err);
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid listId provided' });
    }
    res.status(500).json({ error: 'Internal server error while creating card' });
  }
};

// 2. Move a Card (Drag and Drop)
// Handles updating order within a list, or moving horizontally to a new list
const moveCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, listId } = req.body;

    if (position === undefined) {
      return res.status(400).json({ error: 'position is required' });
    }

    // Build the dynamic update object
    const updateData = { position };

    // If a new listId is passed, that means it crossed over into a new column
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
    // Tell Prisma to fetch all records from the 'card' table
    const cards = await prisma.card.findMany();

    // Send the data back to the browser/Postman as JSON
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

// 5. Update Card Details (title, description, etc.)
const updateCardDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Build update data dynamically so we only update fields that were sent
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'At least one field (title or description) is required' });
    }

    const card = await prisma.card.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(card);
  } catch (err) {
    console.error('Error updating card details:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(500).json({ error: 'Internal server error while updating card' });
  }
};

module.exports = {
  createCard,
  moveCard,
  getCards,
  deleteCard,
  updateCardDetails,
};
