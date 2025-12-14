const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

// Create a new game
router.post('/create', auth, gameController.createGame);

// Join a game
router.post('/join/:gameId', auth, gameController.joinGame);

// Get game state
router.get('/:gameId', auth, gameController.getGame);

// Make a move
router.post('/move', auth, gameController.makeMove);

// Get active games
router.get('/active/list', auth, gameController.getActiveGames);

// Get game history
router.get('/history/list', auth, gameController.getGameHistory);

module.exports = router;