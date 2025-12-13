const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  wins: { type: Number, default: 0 },
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
