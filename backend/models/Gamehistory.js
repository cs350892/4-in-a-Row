const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  gameId: String,
  player1: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    result: { type: String, enum: ['win', 'loss', 'draw'] }
  },
  player2: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    result: { type: String, enum: ['win', 'loss', 'draw'] }
  },
  winner: String,
  moves: Number,
  duration: Number, // in seconds
  boardState: [[String]],
  gameType: String,
  playedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameHistory', gameHistorySchema);