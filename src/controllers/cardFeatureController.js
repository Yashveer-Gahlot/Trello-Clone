const prisma = require('../config/db');
const { fullCardInclude } = require('./boardController');

// Helper: Fetch a full card with all relations
const getFullCard = (cardId) =>
  prisma.card.findUnique({ where: { id: cardId }, include: fullCardInclude });

// ─── LABELS ───────────────────────────────────────────────

// Add a label to a card
const addLabelToCard = async (req, res) => {
  try {
    const { cardId, labelId } = req.params;
    await prisma.cardLabel.create({ data: { cardId, labelId } });
    const card = await getFullCard(cardId);
    res.status(201).json(card);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Label already on card' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'Invalid cardId or labelId' });
    console.error('Error adding label:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle a label on a card
const toggleCardLabel = async (req, res) => {
  try {
    const { cardId, labelId } = req.params;

    const existingLink = await prisma.cardLabel.findUnique({
      where: { cardId_labelId: { cardId, labelId } },
    });

    if (existingLink) {
      await prisma.cardLabel.delete({ where: { cardId_labelId: { cardId, labelId } } });
    } else {
      await prisma.cardLabel.create({ data: { cardId, labelId } });
    }

    const card = await getFullCard(cardId);
    res.status(200).json(card);
  } catch (err) {
    if (err.code === 'P2003') return res.status(400).json({ error: 'Invalid cardId or labelId' });
    console.error('Error toggling label:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove a label from a card
const removeLabelFromCard = async (req, res) => {
  try {
    const { cardId, labelId } = req.params;
    await prisma.cardLabel.delete({ where: { cardId_labelId: { cardId, labelId } } });
    const card = await getFullCard(cardId);
    res.status(200).json(card);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Label not found on card' });
    console.error('Error removing label:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── MEMBERS ──────────────────────────────────────────────

// Add a member to a card
const addMemberToCard = async (req, res) => {
  try {
    const { cardId, userId } = req.params;
    await prisma.cardMember.create({ data: { cardId, userId } });
    const card = await getFullCard(cardId);
    res.status(201).json(card);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Member already on card' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'Invalid cardId or userId' });
    console.error('Error adding member:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove a member from a card
const removeMemberFromCard = async (req, res) => {
  try {
    const { cardId, userId } = req.params;
    await prisma.cardMember.delete({ where: { cardId_userId: { cardId, userId } } });
    const card = await getFullCard(cardId);
    res.status(200).json(card);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Member not found on card' });
    console.error('Error removing member:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── CHECKLISTS ───────────────────────────────────────────

// Create a checklist on a card
const createChecklist = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title } = req.body;

    if (!title) return res.status(400).json({ error: 'title is required' });

    // Calculate position
    const lastChecklist = await prisma.checklist.findFirst({
      where: { cardId },
      orderBy: { position: 'desc' },
    });
    const position = lastChecklist ? lastChecklist.position + 1024 : 1024;

    await prisma.checklist.create({
      data: { cardId, title, position },
    });

    const card = await getFullCard(cardId);
    res.status(201).json(card);
  } catch (err) {
    if (err.code === 'P2003') return res.status(400).json({ error: 'Invalid cardId' });
    console.error('Error creating checklist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a checklist
const deleteChecklist = async (req, res) => {
  try {
    const { cardId, checklistId } = req.params;
    await prisma.checklist.delete({ where: { id: checklistId } });
    const card = await getFullCard(cardId);
    res.status(200).json(card);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Checklist not found' });
    console.error('Error deleting checklist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── CHECKLIST ITEMS ──────────────────────────────────────

// Add an item to a checklist
const addChecklistItem = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'content is required' });

    const lastItem = await prisma.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: 'desc' },
    });
    const position = lastItem ? lastItem.position + 1024 : 1024;

    await prisma.checklistItem.create({
      data: { checklistId, content, position },
    });

    // Find the card via the checklist to return full card
    const checklist = await prisma.checklist.findUnique({ where: { id: checklistId } });
    const card = await getFullCard(checklist.cardId);
    res.status(201).json(card);
  } catch (err) {
    if (err.code === 'P2003') return res.status(400).json({ error: 'Invalid checklistId' });
    console.error('Error adding checklist item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Toggle a checklist item's isCompleted
const toggleChecklistItem = async (req, res) => {
  try {
    const { checklistId, itemId } = req.params;

    const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Checklist item not found' });

    await prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted: !item.isCompleted },
    });

    const checklist = await prisma.checklist.findUnique({ where: { id: checklistId } });
    const card = await getFullCard(checklist.cardId);
    res.status(200).json(card);
  } catch (err) {
    console.error('Error toggling checklist item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a checklist item
const deleteChecklistItem = async (req, res) => {
  try {
    const { checklistId, itemId } = req.params;

    await prisma.checklistItem.delete({ where: { id: itemId } });

    const checklist = await prisma.checklist.findUnique({ where: { id: checklistId } });
    const card = await getFullCard(checklist.cardId);
    res.status(200).json(card);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Checklist item not found' });
    console.error('Error deleting checklist item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── ATTACHMENTS ──────────────────────────────────────────────

// Upload an attachment
const uploadAttachment = async (req, res) => {
  try {
    const { cardId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    await prisma.attachment.create({
      data: {
        cardId,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
      }
    });

    const card = await getFullCard(cardId);
    res.status(201).json(card);
  } catch (err) {
    if (err.code === 'P2003') return res.status(404).json({ error: 'Card not found' });
    console.error('Error uploading attachment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete an attachment
const deleteAttachment = async (req, res) => {
  try {
    const { cardId, attachmentId } = req.params;

    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });
    
    await prisma.attachment.delete({ where: { id: attachmentId } });

    const card = await getFullCard(cardId);
    res.status(200).json(card);
  } catch (err) {
    console.error('Error deleting attachment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addLabelToCard,
  removeLabelFromCard,
  toggleCardLabel,
  addMemberToCard,
  removeMemberFromCard,
  createChecklist,
  deleteChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  uploadAttachment,
  deleteAttachment,
};
