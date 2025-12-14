// Generate unique game ID
exports.generateGameId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format duration
exports.formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Validate move
exports.validateMove = (board, column) => {
  if (column < 0 || column > 6) return false;
  return board[0][column] === null;
};

// Create initial board
exports.createBoard = () => {
  return Array(6).fill().map(() => Array(7).fill(null));
};

// Check if board is full
exports.isBoardFull = (board) => {
  return board[0].every(cell => cell !== null);
};