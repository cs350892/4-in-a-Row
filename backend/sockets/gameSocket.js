const { joinQueue } = require('../game/matchmaking/queue');
const { getBestMove } = require('../game/bot');
const { Player, Game } = require('../game/Game');
const { saveCompletedGame, updateLeaderboard } = require('../controllers/gameController');

const activeGames = new Map(); // gameId -> { game, players, timers }
const playerToGame = new Map(); // playerId -> gameId

function setupGameSocket(io) {
  io.on('connection', (socket) => {
    let currentGameId = null;
    let playerId = socket.id;
    let username = null;

    // Join matchmaking queue
    socket.on('joinQueue', async (data) => {
      username = data.username;
      const { gameId, game, vsBot } = await joinQueue(playerId, username);
      currentGameId = gameId;
      playerToGame.set(playerId, gameId);
      if (!activeGames.has(gameId)) {
        activeGames.set(gameId, { game, players: {}, timers: {} });
      }
      const gameObj = activeGames.get(gameId);
      gameObj.players[playerId] = socket;
      socket.join(gameId);
      if (vsBot) {
        socket.emit('gameStart', { gameId, game, vsBot: true });
      } else {
        // Wait for both players
        if (Object.keys(gameObj.players).length === 2) {
          io.to(gameId).emit('gameStart', { gameId, game, vsBot: false });
        } else {
          socket.emit('waiting');
        }
      }
    });

    // Make a move
    socket.on('makeMove', ({ gameId, column }) => {
      const gameObj = activeGames.get(gameId);
      if (!gameObj) return;
      const { game } = gameObj;
      if (game.status !== 'playing') return;
      const playerIdx = Object.keys(gameObj.players).indexOf(playerId);
      if (playerIdx !== game.currentTurn) return;
      if (!game.makeMove(column)) return;
      io.to(gameId).emit('gameUpdate', { board: game.board, currentTurn: game.currentTurn, status: game.status });
      // Bot move if needed
      if (game.status === 'playing' && Object.keys(gameObj.players).length === 1) {
        setTimeout(() => {
          const botCol = getBestMove(game.board, 'Y');
          game.makeMove(botCol);
          io.to(gameId).emit('gameUpdate', { board: game.board, currentTurn: game.currentTurn, status: game.status });
          if (game.status === 'finished') handleGameEnd(gameId, gameObj);
        }, 500);
      }
      if (game.status === 'finished') handleGameEnd(gameId, gameObj);
    });

    // Rejoin game
    socket.on('rejoinGame', ({ gameId }) => {
      const gameObj = activeGames.get(gameId);
      if (gameObj) {
        gameObj.players[playerId] = socket;
        socket.join(gameId);
        socket.emit('gameUpdate', { board: gameObj.game.board, currentTurn: gameObj.game.currentTurn, status: gameObj.game.status });
      } else {
        socket.emit('gameOver', { error: 'Game not found or expired' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (!currentGameId) return;
      const gameObj = activeGames.get(currentGameId);
      if (!gameObj) return;
      // Start 30s forfeit timer
      gameObj.timers[playerId] = setTimeout(() => {
        if (gameObj.game.status === 'playing') {
          gameObj.game.status = 'finished';
          io.to(currentGameId).emit('gameOver', { reason: 'forfeit', winner: getOpponentId(gameObj.players, playerId) });
          handleGameEnd(currentGameId, gameObj);
        }
      }, 30000);
    });
  });
}

function getOpponentId(players, playerId) {
  return Object.keys(players).find(id => id !== playerId);
}

async function handleGameEnd(gameId, gameObj) {
  const { game } = gameObj;
  // Save to DB
  await saveCompletedGame({
    gameId,
    player1: game.players[0].username,
    player2: game.players[1].username,
    winner: game.winner ? game.winner.username : null,
    duration: 0, // You can add duration logic
    createdAt: new Date()
  });
  if (game.winner) await updateLeaderboard(game.winner.username);
  io.to(gameId).emit('gameOver', { winner: game.winner ? game.winner.username : null });
  setTimeout(() => {
    activeGames.delete(gameId);
  }, 30000);
}

module.exports = { setupGameSocket };
