const mongoose = require('mongoose');

const CompletedGameSchema = new mongoose.Schema({
  gameId: String,
  player1: String,
  player2: String, // or "Bot"
  winner: { type: String, default: null }, // null for draw
  duration: Number, // seconds
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CompletedGame', CompletedGameSchema);
