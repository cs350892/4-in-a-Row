const Leaderboard = require('../models/Leaderboard');
const CompletedGame = require('../models/CompletedGame');

// Save a completed game
async function saveCompletedGame(game) {
  const completed = new CompletedGame(game);
  await completed.save();
}

// Upsert leaderboard: increment wins for winner, or create if not exists
async function updateLeaderboard(winnerUsername) {
  if (!winnerUsername) return;
  await Leaderboard.findOneAndUpdate(
    { username: winnerUsername },
    { $inc: { wins: 1 } },
    { upsert: true, new: true }
  );
}

// Get top 10 leaderboard by wins
async function getLeaderboard() {
  return Leaderboard.find().sort({ wins: -1 }).limit(10).lean();
}

module.exports = {
  saveCompletedGame,
  updateLeaderboard,
  getLeaderboard,
};
