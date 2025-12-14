const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GameHistory = require('../models/Gamehistory');
const auth = require('../middleware/auth');

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await User.find()
      .select('username stats.wins stats.totalGames stats.winRate avatar')
      .sort({ 'stats.winRate': -1, 'stats.wins': -1 })
      .limit(10);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get online users
router.get('/online-users', auth, async (req, res) => {
  try {
    const onlineUsers = await User.find({ isOnline: true })
      .select('username avatar stats lastSeen')
      .limit(20);
    
    res.json(onlineUsers);
  } catch (error) {
    console.error('Online users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent games
router.get('/recent-games', async (req, res) => {
  try {
    const recentGames = await GameHistory.find()
      .sort({ playedAt: -1 })
      .limit(10)
      .populate('player1.userId', 'username avatar')
      .populate('player2.userId', 'username avatar');
    
    res.json(recentGames);
  } catch (error) {
    console.error('Recent games error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;