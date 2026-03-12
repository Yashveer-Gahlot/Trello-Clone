const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

// Define API routes for lists
router.post('/', listController.createList);
router.put('/:id/move', listController.moveList);
router.delete('/:id', listController.deleteList);

module.exports = router;
