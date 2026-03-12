const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

// Define API routes for boards
router.get('/', boardController.getAllBoards);
router.get('/:id', boardController.getBoardDetails);
router.post('/', boardController.createBoard);
router.delete('/:id', boardController.deleteBoard);
router.post('/:boardId/labels', boardController.createLabel);

module.exports = router;
