const Game = require('../models/Game');
const GameHistory = require('../models/Gamehistory');
const User = require('../models/User');
const { generateGameId } = require('../utils/helpers');

// Create a new game
exports.createGame = async (req, res) => {
  try {
    const { gameType, player1Name } = req.body;
    const userId = req.userId;

    // Generate unique game ID
    const gameId = generateGameId();

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create game
    const game = new Game({
      gameId,
      player1: {
        userId: user._id,
        username: player1Name || user.username,
        color: 'red'
      },
      gameType: gameType || 'online',
      status: gameType === 'local' || gameType === 'vsBot' ? 'playing' : 'waiting',
      maxPlayers: gameType === 'local' ? 1 : 2
    });

    // If vsBot, add bot as player2 immediately
    if (gameType === 'vsBot') {
      game.player2 = {
        userId: null,
        username: 'Computer',
        color: 'yellow',
        isBot: true
      };
      game.status = 'playing';
    }

    await game.save();

    res.json({
      success: true,
      game: game.getGameState()
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Server error creating game' });
  }
};

// Join an existing game
exports.joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.userId;

    const game = await Game.findOne({ gameId, status: 'waiting' });
    if (!game) {
      return res.status(404).json({ error: 'Game not found or already started' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if game already has this player
    if (game.player1.userId && game.player1.userId.toString() === userId.toString()) {
      return res.status(400).json({ error: 'You are already in this game' });
    }

    // Add player2
    game.player2 = {
      userId: user._id,
      username: user.username,
      color: 'yellow',
      isBot: false
    };
    game.status = 'playing';
    game.startedAt = new Date();

    await game.save();

    res.json({
      success: true,
      game: game.getGameState()
    });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ error: 'Server error joining game' });
  }
};

// Get game state
exports.getGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({ gameId });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      success: true,
      game: game.getGameState()
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Server error getting game' });
  }
};

// Make a move
exports.makeMove = async (req, res) => {
  try {
    const { gameId, column } = req.body;
    const userId = req.userId;

    const game = await Game.findOne({ gameId, status: 'playing' });
    if (!game) {
      return res.status(404).json({ error: 'Game not found or not active' });
    }

    // Check if it's user's turn
    const player = game.player1.userId && game.player1.userId.toString() === userId.toString() 
      ? 'player1' 
      : game.player2.userId && game.player2.userId.toString() === userId.toString() 
        ? 'player2' 
        : null;

    if (!player || game.currentPlayer !== player) {
      return res.status(400).json({ error: 'Not your turn' });
    }

    // Validate column
    if (column < 0 || column > 6) {
      return res.status(400).json({ error: 'Invalid column' });
    }

    // Make move
    const moveSuccess = game.makeMove(player, column);
    if (!moveSuccess) {
      return res.status(400).json({ error: 'Column is full' });
    }

    await game.save();

    // If game is finished, update user stats and create history
    if (game.status === 'finished') {
      await exports.updateGameResults(game);
    }

    res.json({
      success: true,
      game: game.getGameState()
    });
  } catch (error) {
    console.error('Make move error:', error);
    res.status(500).json({ error: 'Server error making move' });
  }
};

// Update game results and user stats
exports.updateGameResults = async (game) => {
  try {
    // Update player1 stats
    if (game.player1.userId && !game.player1.isBot) {
      const user1 = await User.findById(game.player1.userId);
      if (user1) {
        const result1 = game.winner === 'player1' ? 'win' : 
                       game.winner === 'player2' ? 'loss' : 'draw';
        user1.updateStats(result1);
        await user1.save();
      }
    }

    // Update player2 stats if not bot
    if (game.player2.userId && !game.player2.isBot) {
      const user2 = await User.findById(game.player2.userId);
      if (user2) {
        const result2 = game.winner === 'player2' ? 'win' : 
                       game.winner === 'player1' ? 'loss' : 'draw';
        user2.updateStats(result2);
        await user2.save();
      }
    }

    // Create game history
    const gameHistory = new GameHistory({
      gameId: game.gameId,
      player1: {
        userId: game.player1.userId,
        username: game.player1.username,
        result: game.winner === 'player1' ? 'win' : 
                game.winner === 'player2' ? 'loss' : 'draw'
      },
      player2: {
        userId: game.player2.userId,
        username: game.player2.username,
        result: game.winner === 'player2' ? 'win' : 
                game.winner === 'player1' ? 'loss' : 'draw'
      },
      winner: game.winner,
      moves: game.moves.length,
      duration: game.finishedAt - game.startedAt,
      boardState: game.board,
      gameType: game.gameType
    });

    await gameHistory.save();
  } catch (error) {
    console.error('Update game results error:', error);
  }
};

// Get active games
exports.getActiveGames = async (req, res) => {
  try {
    const games = await Game.find({ 
      status: 'waiting',
      gameType: 'online'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      games: games.map(game => ({
        gameId: game.gameId,
        player1: game.player1.username,
        createdAt: game.createdAt
      }))
    });
  } catch (error) {
    console.error('Get active games error:', error);
    res.status(500).json({ error: 'Server error getting active games' });
  }
};

// Get user's game history
exports.getGameHistory = async (req, res) => {
  try {
    const userId = req.userId;
    
    const history = await GameHistory.find({
      $or: [
        { 'player1.userId': userId },
        { 'player2.userId': userId }
      ]
    })
    .sort({ playedAt: -1 })
    .limit(20);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ error: 'Server error getting game history' });
  }
};