const Game = require('../models/Game');
const User = require('../models/User');
const botController = require('../controllers/botController');

let io;
const waitingPlayers = new Map(); // socketId -> {userId, username}
const playerGames = new Map(); // socketId -> gameId
const gameTimers = new Map(); // gameId -> timeout

const initializeSocket = (socketIo) => {
  io = socketIo;
  
  io.on('connection', (socket) => {
    console.log(`🔗 New connection: ${socket.id}`);
    
    // User joins with auth
    socket.on('authenticate', async (token) => {
      try {
        // In real app, verify JWT token
        const { userId, username } = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        // Update user online status
        await User.findByIdAndUpdate(userId, { 
          isOnline: true,
          lastSeen: new Date()
        });
        
        socket.userId = userId;
        socket.username = username;
        
        socket.emit('authenticated', { userId, username });
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('auth_error', { message: 'Invalid token' });
      }
    });
    
    // Join matchmaking queue
    socket.on('joinQueue', async ({ username, gameType }) => {
      try {
        if (gameType === 'local' || gameType === 'vsBot') {
          // Create local or bot game
          const game = await createGame(socket, username, gameType);
          socket.emit('gameStart', game);
        } else {
          // Online multiplayer
          waitingPlayers.set(socket.id, { userId: socket.userId, username });
          
          // Try to match with another player
          await tryMatchmaking(socket);
        }
      } catch (error) {
        console.error('Join queue error:', error);
        socket.emit('error', { message: 'Failed to join queue' });
      }
    });
    
    // Make a move
    socket.on('makeMove', async ({ gameId, column }) => {
      try {
        const game = await Game.findOne({ gameId });
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Check if it's player's turn
        const player = getPlayerType(socket, game);
        if (!player || game.currentPlayer !== player) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }
        
        // Make the move
        const moveSuccess = game.makeMove(player, column);
        if (!moveSuccess) {
          socket.emit('error', { message: 'Invalid move' });
          return;
        }
        
        await game.save();
        
        // Broadcast move to both players
        const gameState = game.getGameState();
        io.to(gameId).emit('gameUpdate', gameState);
        
        // If game is finished
        if (game.status === 'finished') {
          // Update user stats
          const gameController = require('../controllers/gameController');
          await gameController.updateGameResults(game);
          
          // Clear timer if exists
          if (gameTimers.has(gameId)) {
            clearTimeout(gameTimers.get(gameId));
            gameTimers.delete(gameId);
          }
          
          // Remove from player games
          removePlayerFromGame(socket.id);
          removePlayerFromGame(getOpponentSocketId(game, player));
        } else if (game.player2.isBot) {
          // If playing against bot, trigger bot move after delay
          setTimeout(async () => {
            const updatedGame = await botController.botMove(gameId);
            if (updatedGame) {
              io.to(gameId).emit('gameUpdate', updatedGame);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Make move error:', error);
        socket.emit('error', { message: 'Failed to make move' });
      }
    });
    
    // Join specific game
    socket.on('joinGame', async (gameId) => {
      try {
        const game = await Game.findOne({ gameId, status: 'waiting' });
        if (!game) {
          socket.emit('error', { message: 'Game not found or already started' });
          return;
        }
        
        // Add player to game
        if (!game.player2.userId) {
          game.player2 = {
            userId: socket.userId,
            username: socket.username,
            color: 'yellow',
            isBot: false
          };
          game.status = 'playing';
          game.startedAt = new Date();
          
          await game.save();
          
          // Clear timer if exists
          if (gameTimers.has(gameId)) {
            clearTimeout(gameTimers.get(gameId));
            gameTimers.delete(gameId);
          }
        }
        
        // Join game room
        socket.join(gameId);
        playerGames.set(socket.id, gameId);
        
        // Notify both players
        const gameState = game.getGameState();
        io.to(gameId).emit('gameStart', gameState);
      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
      
      // Remove from waiting players
      waitingPlayers.delete(socket.id);
      
      // Handle game abandonment
      const gameId = playerGames.get(socket.id);
      if (gameId) {
        handlePlayerDisconnect(gameId, socket.id);
        playerGames.delete(socket.id);
      }
      
      // Update user offline status
      if (socket.userId) {
        User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        }).catch(console.error);
      }
    });
  });
};

// Helper functions
const createGame = async (socket, username, gameType) => {
  const game = new Game({
    gameId: generateGameId(),
    player1: {
      userId: socket.userId,
      username: username || socket.username,
      color: 'red'
    },
    gameType,
    status: gameType === 'vsBot' ? 'playing' : 'waiting'
  });
  
  if (gameType === 'vsBot') {
    game.player2 = {
      userId: null,
      username: 'Computer',
      color: 'yellow',
      isBot: true
    };
  }
  
  await game.save();
  
  socket.join(game.gameId);
  playerGames.set(socket.id, game.gameId);
  
  return game.getGameState();
};

const tryMatchmaking = async (socket) => {
  // Find another waiting player
  for (const [otherSocketId, otherPlayer] of waitingPlayers.entries()) {
    if (otherSocketId !== socket.id) {
      // Create game
      const game = new Game({
        gameId: generateGameId(),
        player1: {
          userId: otherPlayer.userId,
          username: otherPlayer.username,
          color: 'red'
        },
        player2: {
          userId: socket.userId,
          username: socket.username,
          color: 'yellow'
        },
        gameType: 'online',
        status: 'playing',
        startedAt: new Date()
      });
      
      await game.save();
      
      // Get both sockets
      const otherSocket = io.sockets.sockets.get(otherSocketId);
      
      // Join game room
      socket.join(game.gameId);
      otherSocket.join(game.gameId);
      
      // Store game references
      playerGames.set(socket.id, game.gameId);
      playerGames.set(otherSocketId, game.gameId);
      
      // Remove from waiting players
      waitingPlayers.delete(socket.id);
      waitingPlayers.delete(otherSocketId);
      
      // Notify both players
      const gameState = game.getGameState();
      io.to(game.gameId).emit('gameStart', gameState);
      
      return;
    }
  }
  
  // No match found, create solo game and start timer for bot
  const game = new Game({
    gameId: generateGameId(),
    player1: {
      userId: socket.userId,
      username: socket.username,
      color: 'red'
    },
    gameType: 'online',
    status: 'waiting'
  });
  
  await game.save();
  
  socket.join(game.gameId);
  playerGames.set(socket.id, game.gameId);
  
  socket.emit('waiting', { gameId: game.gameId });
  
  // Start timer for bot to join
  const timer = setTimeout(async () => {
    const updatedGame = await botController.addBotToGame(game.gameId);
    if (updatedGame) {
      io.to(game.gameId).emit('gameStart', updatedGame);
    }
  }, 10000); // 10 seconds
  
  gameTimers.set(game.gameId, timer);
};

const getPlayerType = (socket, game) => {
  if (game.player1.userId && game.player1.userId.toString() === socket.userId) {
    return 'player1';
  }
  if (game.player2.userId && game.player2.userId.toString() === socket.userId) {
    return 'player2';
  }
  return null;
};

const getOpponentSocketId = (game, playerType) => {
  for (const [socketId, gameId] of playerGames.entries()) {
    if (gameId === game.gameId) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && getPlayerType(socket, game) !== playerType) {
        return socketId;
      }
    }
  }
  return null;
};

const handlePlayerDisconnect = (gameId, socketId) => {
  Game.findOne({ gameId }).then(game => {
    if (game && game.status === 'playing') {
      game.status = 'abandoned';
      game.save();
      
      // Notify other player
      io.to(gameId).emit('gameAbandoned', { message: 'Opponent disconnected' });
    }
  }).catch(console.error);
};

const removePlayerFromGame = (socketId) => {
  if (socketId) {
    playerGames.delete(socketId);
  }
};

const generateGameId = () => {
  return Math.random().toString(36).substring(2, 15);
};

module.exports = { initializeSocket };