// Bot AI Service for Connect Four

class BotService {
  // Get the best move for the bot
  getBotMove(board, botColor) {
    const opponentColor = botColor === 'R' ? 'Y' : 'R';
    
    // 1. Check for winning move
    const winningMove = this.findWinningMove(board, botColor);
    if (winningMove !== -1) return winningMove;
    
    // 2. Check for opponent's winning move and block it
    const blockingMove = this.findWinningMove(board, opponentColor);
    if (blockingMove !== -1) return blockingMove;
    
    // 3. Try to create potential winning positions
    const strategicMove = this.findStrategicMove(board, botColor);
    if (strategicMove !== -1) return strategicMove;
    
    // 4. Return random valid move
    return this.getRandomValidMove(board);
  }
  
  // Find a winning move for given color
  findWinningMove(board, color) {
    for (let col = 0; col < 7; col++) {
      const row = this.getLowestEmptyRow(board, col);
      if (row === -1) continue; // Column is full
      
      // Simulate placing piece
      board[row][col] = color;
      
      // Check if this move wins
      if (this.checkWin(board, row, col, color)) {
        board[row][col] = null; // Reset
        return col;
      }
      
      board[row][col] = null; // Reset
    }
    
    return -1;
  }
  
  // Find strategic move (create multiple threats)
  findStrategicMove(board, color) {
    const scores = [3, 2, 4, 5, 4, 2, 3]; // Center columns are better
    
    // Try center columns first
    for (let i = 0; i < 7; i++) {
      const col = [3, 2, 4, 1, 5, 0, 6][i]; // Priority order
      const row = this.getLowestEmptyRow(board, col);
      if (row === -1) continue;
      
      // Check if move creates multiple threats
      if (this.createsThreat(board, row, col, color)) {
        return col;
      }
    }
    
    return -1;
  }
  
  // Check if move creates a threat
  createsThreat(board, row, col, color) {
    // Simulate move
    board[row][col] = color;
    
    let threatCount = 0;
    
    // Check all directions for potential 3 in a row
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
      // Count consecutive pieces
      let count = 1;
      
      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
            board[newRow][newCol] === color) {
          count++;
        } else {
          break;
        }
      }
      
      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
            board[newRow][newCol] === color) {
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 3) {
        threatCount++;
      }
    }
    
    // Reset board
    board[row][col] = null;
    
    return threatCount >= 2;
  }
  
  // Get random valid move
  getRandomValidMove(board) {
    const validColumns = [];
    for (let col = 0; col < 7; col++) {
      if (this.getLowestEmptyRow(board, col) !== -1) {
        validColumns.push(col);
      }
    }
    
    if (validColumns.length === 0) return 3; // Default to center if all full
    
    // Prefer center columns
    const centerColumns = [3, 2, 4, 1, 5, 0, 6];
    for (const col of centerColumns) {
      if (validColumns.includes(col)) {
        return col;
      }
    }
    
    return validColumns[0];
  }
  
  // Helper: Get lowest empty row in column
  getLowestEmptyRow(board, col) {
    for (let row = 5; row >= 0; row--) {
      if (!board[row][col]) {
        return row;
      }
    }
    return -1;
  }
  
  // Helper: Check if position creates a win
  checkWin(board, row, col, color) {
    // Directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
      let count = 1;
      
      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;
        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
            board[newRow][newCol] === color) {
          count++;
        } else {
          break;
        }
      }
      
      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - i * dx;
        const newCol = col - i * dy;
        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && 
            board[newRow][newCol] === color) {
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 4) {
        return true;
      }
    }
    
    return false;
  }
}

module.exports = new BotService();