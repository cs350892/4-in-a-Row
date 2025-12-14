const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  player1: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    socketId: String,
    color: { type: String, default: 'red' }
  },
  player2: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    socketId: String,
    color: { type: String, default: 'yellow' },
    isBot: { type: Boolean, default: false }
  },
  board: {
    type: [[String]],
    default: Array(6).fill().map(() => Array(7).fill(null))
  },
  currentPlayer: {
    type: String,
    enum: ['player1', 'player2'],
    default: 'player1'
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished', 'abandoned'],
    default: 'waiting'
  },
  winner: {
    type: String,
    enum: ['player1', 'player2', 'draw', null],
    default: null
  },
  moves: [{
    player: String,
    column: Number,
    row: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  gameType: {
    type: String,
    enum: ['local', 'online', 'vsBot'],
    default: 'online'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  finishedAt: Date,
  timeout: {
    type: Number,
    default: 10000 // 10 seconds for bot to join
  },
  maxPlayers: {
    type: Number,
    default: 2
  }
});

// Method to make a move
gameSchema.methods.makeMove = function(player, column) {
  const row = this.getLowestEmptyRow(column);
  if (row === -1) return false; // Column is full
  
  this.board[row][column] = player === 'player1' ? 'R' : 'Y';
  this.moves.push({ player, column, row });
  
  // Check for win or draw
  const winner = this.checkWinner(row, column);
  if (winner) {
    this.status = 'finished';
    this.winner = winner;
    this.finishedAt = new Date();
  } else if (this.checkDraw()) {
    this.status = 'finished';
    this.winner = 'draw';
    this.finishedAt = new Date();
  } else {
    // Switch player
    this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
  }
  
  return true;
};

// Helper method to find lowest empty row
gameSchema.methods.getLowestEmptyRow = function(column) {
  for (let row = 5; row >= 0; row--) {
    if (!this.board[row][column]) {
      return row;
    }
  }
  return -1;
};

// Check for winner
gameSchema.methods.checkWinner = function(row, col) {
  const player = this.board[row][col];
  const playerType = player === 'R' ? 'player1' : 'player2';
  
  // Directions: horizontal, vertical, diagonal down-right, diagonal down-left
  const directions = [
    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1]   // diagonal down-left
  ];
  
  for (const [dx, dy] of directions) {
    let count = 1;
    
    // Check positive direction
    for (let i = 1; i < 4; i++) {
      const newRow = row + i * dx;
      const newCol = col + i * dy;
      if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
          this.board[newRow][newCol] === player) {
        count++;
      } else {
        break;
      }
    }
    
    // Check negative direction
    for (let i = 1; i < 4; i++) {
      const newRow = row - i * dx;
      const newCol = col - i * dy;
      if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
          this.board[newRow][newCol] === player) {
        count++;
      } else {
        break;
      }
    }
    
    if (count >= 4) {
      return playerType;
    }
  }
  
  return null;
};

// Check for draw
gameSchema.methods.checkDraw = function() {
  return this.board[0].every(cell => cell !== null);
};

// Get game state for client
gameSchema.methods.getGameState = function() {
  return {
    gameId: this.gameId,
    board: this.board,
    currentPlayer: this.currentPlayer,
    status: this.status,
    winner: this.winner,
    players: {
      player1: {
        username: this.player1.username,
        color: this.player1.color
      },
      player2: {
        username: this.player2.username,
        color: this.player2.color,
        isBot: this.player2.isBot || false
      }
    },
    moves: this.moves,
    gameType: this.gameType
  };
};

module.exports = mongoose.model('Game', gameSchema);