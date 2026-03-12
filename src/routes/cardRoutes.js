const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const cardFeatureController = require('../controllers/cardFeatureController');
const { upload } = require('../middleware/upload');

// Define API routes for cards
router.get('/', cardController.getCards);
router.post('/', cardController.createCard);
router.put('/:id/move', cardController.moveCard);
router.put('/:id/archive', cardController.archiveCard);
router.put('/:id', cardController.updateCardDetails);
router.delete('/:id', cardController.deleteCard);

// Attachment routes
router.post('/:cardId/attachments', upload.single('file'), cardFeatureController.uploadAttachment);
router.delete('/:cardId/attachments/:attachmentId', cardFeatureController.deleteAttachment);

module.exports = router;
