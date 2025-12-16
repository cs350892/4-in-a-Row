const Game = require('../models/Game');
const botService = require('../services/botService');

// Bot makes a move
exports.botMove = async (gameId) => {
  try {
    console.log(`Bot move requested for game ${gameId}`);
    const game = await Game.findOne({ gameId, status: 'playing' });
    if (!game) {
      console.log(`Game ${gameId} not found or not playing`);
      return null;
    }
    if (!game.player2.isBot) {
      console.log(`Game ${gameId} player2 is not a bot`);
      return null;
    }
    if (game.currentPlayer !== 'player2') {
      console.log(`Game ${gameId} it's not bot's turn, current player: ${game.currentPlayer}`);
      return null;
    }

    console.log(`Bot making move in game ${gameId}, current board:`, game.board);
    // Get bot's move
    const column = botService.getBotMove(game.board, 'Y');
    console.log(`Bot chose column ${column}`);
    
    // Make the move
    const moveSuccess = game.makeMove('player2', column);
    if (!moveSuccess) {
      console.log(`Bot's chosen column ${column} is full, trying random`);
      // If bot's chosen column is full, try another one
      const validColumns = game.board[0]
        .map((cell, index) => cell === null ? index : -1)
        .filter(index => index !== -1);
      
      if (validColumns.length > 0) {
        const randomColumn = validColumns[Math.floor(Math.random() * validColumns.length)];
        console.log(`Bot trying random column ${randomColumn}`);
        game.makeMove('player2', randomColumn);
      } else {
        console.log(`No valid columns for bot to move`);
        return null;
      }
    }

    await game.save();
    console.log(`Bot move completed for game ${gameId}, new currentPlayer: ${game.currentPlayer}`);
    
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