const Leaderboard = require('../models/Leaderboard');
const CompletedGame = require('../models/CompletedGame');

// Save a completed game
async function saveCompletedGame(gameObject) {
  try {
    const duration = Date.now() - gameObject.createdAt; // Duration in milliseconds
    const completedGame = new CompletedGame({
      gameId: gameObject.gameId,
      player1: gameObject.players[0].username,
      player2: gameObject.players[1] ? gameObject.players[1].username : 'Bot',
      winner: gameObject.winner ? gameObject.winner.username : null,
      duration: Math.floor(duration / 1000), // Convert to seconds
      createdAt: new Date(gameObject.createdAt),
    });
    await completedGame.save();
  } catch (error) {
    console.log('Error saving completed game:', error.message);
  }
}

// Update leaderboard: increment wins for the winner
async function updateLeaderboard(username) {
  try {
    if (!username) return;
    await Leaderboard.findOneAndUpdate(
      { username },
      { $inc: { wins: 1 } },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.log('Error updating leaderboard:', error.message);
  }
}

// Get top 10 leaderboard sorted by wins descending
async function getLeaderboard() {
  try {
    return await Leaderboard.find().sort({ wins: -1 }).limit(10).lean();
  } catch (error) {
    console.log('Error getting leaderboard:', error.message);
    return [];
  }
}

module.exports = {
  saveCompletedGame,
  updateLeaderboard,
  getLeaderboard,
};
