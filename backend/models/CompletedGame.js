const mongoose = require('mongoose');

const CompletedGameSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  player1: { type: String, required: true },
  player2: { type: String, required: true },
  winner: { type: String, default: null }, // null for draw
  duration: { type: Number, required: true }, // seconds
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CompletedGame', CompletedGameSchema);
