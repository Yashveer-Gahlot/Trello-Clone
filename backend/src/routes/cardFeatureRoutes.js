const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cardFeatureController');

// Labels on cards
router.post('/cards/:cardId/labels/:labelId', ctrl.addLabelToCard);
router.delete('/cards/:cardId/labels/:labelId', ctrl.removeLabelFromCard);
router.post('/cards/:cardId/labels/:labelId/toggle', ctrl.toggleCardLabel);

// Members on cards
router.post('/cards/:cardId/members/:userId', ctrl.addMemberToCard);
router.delete('/cards/:cardId/members/:userId', ctrl.removeMemberFromCard);

// Checklists on cards
router.post('/cards/:cardId/checklists', ctrl.createChecklist);
router.delete('/cards/:cardId/checklists/:checklistId', ctrl.deleteChecklist);

// Checklist items
router.post('/checklists/:checklistId/items', ctrl.addChecklistItem);
router.patch('/checklists/:checklistId/items/:itemId', ctrl.toggleChecklistItem);
router.delete('/checklists/:checklistId/items/:itemId', ctrl.deleteChecklistItem);

module.exports = router;
