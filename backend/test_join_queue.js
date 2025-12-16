const io = require('socket.io-client');

// Test the joinQueue functionality
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');

  // Test joinQueue for vsBot
  socket.emit('joinQueue', {
    username: 'TestPlayer',
    gameType: 'vsBot'
  });
});

socket.on('gameStart', (data) => {
  console.log('Game started:', data);
  socket.disconnect();
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
  socket.disconnect();
});

socket.on('disconnect', () => {
  console.log('Disconnected');
  process.exit(0);
});