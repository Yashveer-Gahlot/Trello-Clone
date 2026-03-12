const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// Define API routes for cards
router.get('/', cardController.getCards);
router.post('/', cardController.createCard);
router.put('/:id/move', cardController.moveCard);
router.put('/:id', cardController.updateCardDetails);
router.delete('/:id', cardController.deleteCard);

module.exports = router;
