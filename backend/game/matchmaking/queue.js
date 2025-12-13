const { v4: uuidv4 } = require('uuid');
const { Player, Game } = require('../Game');
const { getBestMove } = require('../bot');

let waitingPlayer = null;
let waitingTimeout = null;

function joinQueue(playerId, username) {
  return new Promise((resolve) => {
    if (waitingPlayer) {
      // Match found
      const gameId = uuidv4();
      const player1 = new Player(waitingPlayer.id, waitingPlayer.username, 'R');
      const player2 = new Player(playerId, username, 'Y');
      const game = new Game(player1, player2);
      game.status = 'playing';
      clearTimeout(waitingTimeout);
      waitingPlayer = null;
      resolve({ gameId, game, vsBot: false });
    } else {
      // No one waiting, add to queue
      waitingPlayer = { id: playerId, username };
      waitingTimeout = setTimeout(() => {
        // Pair with bot after 10 seconds
        const gameId = uuidv4();
        const player1 = new Player(playerId, username, 'R');
        const bot = new Player('bot', 'Bot', 'Y');
        const game = new Game(player1, bot);
        game.status = 'playing';
        waitingPlayer = null;
        resolve({ gameId, game, vsBot: true });
      }, 10000);
    }
  });
}

module.exports = { joinQueue };
