const Game = require('../models/Game');
const botService = require('../services/botService');

// Bot makes a move
exports.botMove = async (gameId) => {
  try {
    const game = await Game.findOne({ gameId, status: 'playing' });
    if (!game || !game.player2.isBot || game.currentPlayer !== 'player2') {
      return null;
    }

    // Get bot's move
    const column = botService.getBotMove(game.board, 'Y');
    
    // Make the move
    const moveSuccess = game.makeMove('player2', column);
    if (!moveSuccess) {
      // If bot's chosen column is full, try another one
      const validColumns = game.board[0]
        .map((cell, index) => cell === null ? index : -1)
        .filter(index => index !== -1);
      
      if (validColumns.length > 0) {
        const randomColumn = validColumns[Math.floor(Math.random() * validColumns.length)];
        game.makeMove('player2', randomColumn);
      }
    }

    await game.save();

    // If game is finished, update results
    if (game.status === 'finished') {
      const gameController = require('./gameController');
      await gameController.updateGameResults(game);
    }

    return game.getGameState();
  } catch (error) {
    console.error('Bot move error:', error);
    return null;
  }
};

// Add bot to game if no player joins
exports.addBotToGame = async (gameId) => {
  try {
    const game = await Game.findOne({ 
      gameId, 
      status: 'waiting',
      gameType: 'online'
    });

    if (!game || game.player2.userId) {
      return null;
    }

    // Add bot as player2
    game.player2 = {
      userId: null,
      username: 'Computer',
      color: 'yellow',
      isBot: true
    };
    game.status = 'playing';
    game.startedAt = new Date();

    await game.save();

    return game.getGameState();
  } catch (error) {
    console.error('Add bot to game error:', error);
    return null;
  }
};