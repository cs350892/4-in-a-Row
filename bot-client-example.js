// Simple Bot Client Example
// This shows how to connect a bot to the Connect-4 server

const io = require('socket.io-client');

// Bot configuration
const BOT_CONFIG = {
  name: 'BotPlayer',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000'
};

class ConnectFourBot {
  constructor() {
    this.socket = null;
    this.gameId = null;
    this.isMyTurn = false;
  }

  connect() {
    console.log(`🤖 Connecting bot "${BOT_CONFIG.name}" to ${BOT_CONFIG.backendUrl}`);

    this.socket = io(BOT_CONFIG.backendUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Bot connected successfully:', this.socket.id);
      this.joinBotGame();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Bot disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Bot connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('🚨 Bot socket error:', error);
    });

    // Game events
    this.socket.on('gameStart', (gameData) => {
      console.log('🎮 Game started:', gameData.gameId);
      this.gameId = gameData.gameId;
      this.isMyTurn = gameData.currentPlayer === 'player2'; // Bot is player2

      if (this.isMyTurn) {
        this.makeMove();
      }
    });

    this.socket.on('gameUpdate', (gameData) => {
      console.log('🔄 Game updated');
      this.isMyTurn = gameData.currentPlayer === 'player2';

      if (this.isMyTurn && gameData.status === 'playing') {
        setTimeout(() => this.makeMove(), 1000); // Delay for realism
      }
    });

    this.socket.on('gameOver', (result) => {
      console.log('🏁 Game over:', result);
      this.gameId = null;
      this.isMyTurn = false;
    });
  }

  joinBotGame() {
    console.log('🎯 Joining bot game...');
    this.socket.emit('joinQueue', {
      username: BOT_CONFIG.name,
      gameType: 'vsBot',
      isBot: true
    });
  }

  makeMove() {
    if (!this.gameId || !this.isMyTurn) return;

    // Simple AI: choose random valid column
    const column = Math.floor(Math.random() * 7);
    console.log(`🎲 Bot making move in column ${column}`);

    this.socket.emit('makeMove', {
      gameId: this.gameId,
      column: column
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🤖 Bot disconnected');
    }
  }
}

// Usage example
if (require.main === module) {
  const bot = new ConnectFourBot();
  bot.connect();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    bot.disconnect();
    process.exit(0);
  });
}

module.exports = ConnectFourBot;