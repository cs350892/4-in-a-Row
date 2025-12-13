const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/gameController');

// GET /api/leaderboard - top 10 players
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
