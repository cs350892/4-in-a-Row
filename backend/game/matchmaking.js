const { v4: uuidv4 } = require('uuid');
const { Player, Game } = require('./Game');

class Queue {
  constructor() {
    this.waitingPlayers = []; // Array of player data {id, username}
    this.activeGames = new Map(); // Map<gameId, Game>
  }

  // Enqueue a player: returns a Promise that resolves with gameId when matched (with player or bot)
  enqueue(playerData) {
    return new Promise((resolve) => {
      this.waitingPlayers.push(playerData);

      if (this.waitingPlayers.length >= 2) {
        // Match with another waiting player
        const player1Data = this.waitingPlayers.shift();
        const player2Data = this.waitingPlayers.shift();
        const gameId = uuidv4();
        const player1 = new Player(player1Data.id, player1Data.username, 'R');
        const player2 = new Player(player2Data.id, player2Data.username, 'Y');
        const game = new Game(gameId, player1);
        game.addSecondPlayer(player2);
        this.activeGames.set(gameId, game);
        resolve(gameId);
      } else {
        // No match yet, set timeout to pair with bot after 10 seconds
        setTimeout(() => {
          if (this.waitingPlayers.includes(playerData)) {
            // Still waiting, pair with bot
            this.waitingPlayers = this.waitingPlayers.filter(p => p !== playerData);
            const gameId = uuidv4();
            const player1 = new Player(playerData.id, playerDataData.username, 'R');
            const bot = new Player('bot', 'Bot', 'Y');
            const game = new Game(gameId, player1);
            game.addSecondPlayer(bot);
            this.activeGames.set(gameId, game);
            resolve(gameId);
          }
        }, 10000);
      }
    });
  }

  // Get the game by gameId
  getGame(gameId) {
    return this.activeGames.get(gameId);
  }
}

module.exports = { Queue };