const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { Player, Game } = require('../game/Game');
const { botMove } = require('../game/bot');
const { Queue } = require('../game/matchmaking');
const { saveCompletedGame, updateLeaderboard } = require('../controllers/gameController');

// Create a global queue instance for matchmaking
const queue = new Queue();

// Store active games and timers for forfeit handling
const activeGames = new Map(); // gameId -> { game, players: [socket1, socket2], forfeitTimer }
const disconnectTimers = new Map(); // socketId -> timer

function setupSocket(server) {
  // Initialize Socket.io with CORS settings
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for development
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A new player connected:', socket.id);

    // Handle joining the matchmaking queue
    socket.on('joinQueue', async (username) => {
      console.log(`Player ${username} (${socket.id}) is joining the queue`);

      try {
        // Create a new player object with a unique ID and username
        const playerData = {
          id: socket.id, // Use socket ID as player ID for simplicity
          username: username
        };

        // Add player to the queue and wait for a match
        const gameId = await queue.enqueue(playerData);

        if (gameId) {
          // Player was matched with another player or bot
          const game = queue.getGame(gameId);
          if (game) {
            // Join the game room
            socket.join(gameId);

            // Store game reference for later use
            activeGames.set(gameId, {
              game: game,
              players: [socket, game.players[1] && game.players[1].id !== 'bot' ? null : null], // Track sockets
              forfeitTimer: null
            });

            // Find the player's index in the game
            const playerIndex = game.players[0].id === socket.id ? 0 : 1;
            activeGames.get(gameId).players[playerIndex] = socket;

            // Emit game start event with initial game state
            socket.emit('gameStart', {
              gameId: gameId,
              board: game.board.map(row => row.map(cell => cell === 0 ? '' : cell === 1 ? 'R' : 'Y')),
              players: game.players.map(p => ({ id: p.id, username: p.username, color: p.color })),
              currentTurn: game.currentTurn,
              yourIndex: playerIndex,
              status: game.status
            });

            console.log(`Game ${gameId} started for ${username}`);
          }
        } else {
          // Player is waiting for a match
          socket.emit('waiting');
          console.log(`${username} is waiting for a match`);
        }
      } catch (error) {
        console.error('Error in joinQueue:', error);
        socket.emit('error', 'Failed to join queue');
      }
    });

    // Handle making a move in the game
    socket.on('makeMove', ({ gameId, column }) => {
      console.log(`Move attempt in game ${gameId}, column ${column} by ${socket.id}`);

      const gameData = activeGames.get(gameId);
      if (!gameData || gameData.game.status !== 'playing') {
        socket.emit('error', 'Invalid game or game not in progress');
        return;
      }

      const game = gameData.game;

      // Determine which player this socket represents
      let playerIndex = -1;
      if (game.players[0] && game.players[0].id === socket.id) {
        playerIndex = 0;
      } else if (game.players[1] && game.players[1].id === socket.id) {
        playerIndex = 1;
      }

      if (playerIndex === -1) {
        socket.emit('error', 'You are not a player in this game');
        return;
      }

      // Check if it's this player's turn
      if (game.currentTurn !== playerIndex) {
        socket.emit('error', 'Not your turn');
        return;
      }

      // Attempt to make the move
      const moveSuccess = game.makeMove(playerIndex, column);
      if (!moveSuccess) {
        socket.emit('error', 'Invalid move');
        return;
      }

      // If the second player is a bot and it's now the bot's turn, make bot move
      if (game.players[1] && game.players[1].id === 'bot' && game.currentTurn === 1 && game.status === 'playing') {
        console.log('Bot is making a move');
        const botColumn = botMove(game);
        game.makeMove(1, botColumn);
      }

      // Emit game update to all players in the room
      io.to(gameId).emit('gameUpdate', {
        board: game.board.map(row => row.map(cell => cell === 0 ? '' : cell === 1 ? 'R' : 'Y')),
        currentTurn: game.currentTurn,
        lastMove: { playerIndex, column },
        status: game.status
      });

      // Check if the game has finished
      if (game.status === 'finished') {
        console.log(`Game ${gameId} finished`);

        // Save the completed game to database
        saveCompletedGame(game);

        // Update leaderboard if there's a winner
        if (game.winner) {
          updateLeaderboard(game.winner.username);
        }

        // Emit game over event
        io.to(gameId).emit('gameOver', {
          winner: game.winner ? { username: game.winner.username, color: game.winner.color } : null,
          board: game.board.map(row => row.map(cell => cell === 0 ? '' : cell === 1 ? 'R' : 'Y')),
          status: 'finished'
        });

        // Clean up the game from active games
        activeGames.delete(gameId);
      }
    });

    // Handle rejoining a game after disconnection
    socket.on('rejoin', ({ gameId }) => {
      console.log(`Player ${socket.id} attempting to rejoin game ${gameId}`);

      const gameData = activeGames.get(gameId);
      if (!gameData) {
        socket.emit('error', 'Game not found');
        return;
      }

      const game = gameData.game;

      // Check if rejoining within 30 seconds of last activity
      const timeSinceLastActivity = Date.now() - game.lastActivity;
      if (timeSinceLastActivity > 30000) { // 30 seconds
        socket.emit('error', 'Rejoin time expired');
        return;
      }

      // Find the player's index
      let playerIndex = -1;
      if (game.players[0] && game.players[0].id === socket.id) {
        playerIndex = 0;
      } else if (game.players[1] && game.players[1].id === socket.id) {
        playerIndex = 1;
      }

      if (playerIndex === -1) {
        socket.emit('error', 'You are not a player in this game');
        return;
      }

      // Rejoin the game room
      socket.join(gameId);
      gameData.players[playerIndex] = socket;

      // Clear any forfeit timer
      if (gameData.forfeitTimer) {
        clearTimeout(gameData.forfeitTimer);
        gameData.forfeitTimer = null;
      }

      // Emit rejoin success with current game state
      socket.emit('gameRejoined', {
        gameId: gameId,
        board: game.board.map(row => row.map(cell => cell === 0 ? '' : cell === 1 ? 'R' : 'Y')),
        players: game.players.map(p => ({ id: p.id, username: p.username, color: p.color })),
        currentTurn: game.currentTurn,
        yourIndex: playerIndex,
        status: game.status
      });

      console.log(`Player ${socket.id} rejoined game ${gameId}`);
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
      console.log(`Player ${socket.id} disconnected`);

      // Start a 30-second timer for potential forfeit
      const timer = setTimeout(() => {
        // Find the game this player was in
        for (const [gameId, gameData] of activeGames.entries()) {
          const game = gameData.game;
          let playerIndex = -1;
          if (game.players[0] && game.players[0].id === socket.id) {
            playerIndex = 0;
          } else if (game.players[1] && game.players[1].id === socket.id) {
            playerIndex = 1;
          }

          if (playerIndex !== -1) {
            // Player was in this game, forfeit it
            console.log(`Forfeiting game ${gameId} due to player ${socket.id} disconnection`);

            game.status = 'finished';
            game.winner = game.players[1 - playerIndex]; // Other player wins

            // Save and update as if game ended normally
            saveCompletedGame(game);
            if (game.winner) {
              updateLeaderboard(game.winner.username);
            }

            // Notify remaining players
            io.to(gameId).emit('gameOver', {
              winner: game.winner ? { username: game.winner.username, color: game.winner.color } : null,
              reason: 'forfeit',
              board: game.board.map(row => row.map(cell => cell === 0 ? '' : cell === 1 ? 'R' : 'Y')),
              status: 'finished'
            });

            // Clean up
            activeGames.delete(gameId);
            break;
          }
        }
      }, 30000); // 30 seconds

      // Store the timer
      disconnectTimers.set(socket.id, timer);
    });
  });
}

module.exports = { setupSocket };
