const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

// Define API routes for boards
router.get('/', boardController.getBoardDetails); // Route for finding default board
router.post('/', boardController.createBoard);

module.exports = router;
