// Bot logic for Connect Four using minimax with alpha-beta pruning
// Bot plays as player 2 (value 2), opponent is player 1 (value 1)
// Board is 6x7 array with 0 (empty), 1 (player1), 2 (player2)

const ROWS = 6;
const COLS = 7;
const MAX_DEPTH = 5; // Depth limit for minimax, set to 5 for beginner-friendly difficulty

// Main function: returns the best column (0-6) for the bot to move
function botMove(game) {
  const botValue = 2; // Bot is player 2
  const opponentValue = 1; // Opponent is player 1
  const validMoves = getValidMoves(game.board);

  if (validMoves.length === 0) return null; // No moves available (shouldn't happen)

  let bestCol = validMoves[0];
  let bestScore = -Infinity;

  // Evaluate each possible move using minimax
  for (const col of validMoves) {
    const newBoard = makeMove(game.board, col, botValue);
    const score = minimax(newBoard, MAX_DEPTH - 1, -Infinity, Infinity, false, botValue, opponentValue);

    // Update best move: higher score is better, or closer to center column (3) on ties
    if (score > bestScore || (score === bestScore && Math.abs(col - 3) < Math.abs(bestCol - 3))) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
}

// Minimax algorithm with alpha-beta pruning
// Returns the evaluation score for the board
function minimax(board, depth, alpha, beta, maximizing, botValue, opponentValue) {
  // Base case: depth reached or game over
  if (depth === 0 || isTerminal(board, botValue, opponentValue)) {
    return evaluate(board, botValue, opponentValue);
  }

  const validMoves = getValidMoves(board);

  if (maximizing) {
    // Bot's turn (maximize score)
    let maxEval = -Infinity;
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, botValue);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, botValue, opponentValue);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    // Opponent's turn (minimize score)
    let minEval = Infinity;
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, opponentValue);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, botValue, opponentValue);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}

// Check if the game is in a terminal state (win or draw)
function isTerminal(board, botValue, opponentValue) {
  return checkWin(board, botValue) || checkWin(board, opponentValue) || isFull(board);
}

// Evaluate the board: +100 for bot win, -100 for opponent win, 0 for draw, else heuristic
function evaluate(board, botValue, opponentValue) {
  if (checkWin(board, botValue)) return 100;
  if (checkWin(board, opponentValue)) return -100;
  if (isFull(board)) return 0;

  // Simple heuristic: favor center column
  let score = 0;
  for (let row = 0; row < ROWS; row++) {
    if (board[row][3] === botValue) score += 3; // Bot in center
    if (board[row][3] === opponentValue) score -= 3; // Opponent in center
  }
  return score;
}

// Check for 4-in-a-row win
function checkWin(board, value) {
  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (board[row][col] === value && board[row][col + 1] === value &&
          board[row][col + 2] === value && board[row][col + 3] === value) {
        return true;
      }
    }
  }
  // Vertical
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row <= ROWS - 4; row++) {
      if (board[row][col] === value && board[row + 1][col] === value &&
          board[row + 2][col] === value && board[row + 3][col] === value) {
        return true;
      }
    }
  }
  // Diagonal (top-left to bottom-right)
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (board[row][col] === value && board[row + 1][col + 1] === value &&
          board[row + 2][col + 2] === value && board[row + 3][col + 3] === value) {
        return true;
      }
    }
  }
  // Diagonal (bottom-left to top-right)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (board[row][col] === value && board[row - 1][col + 1] === value &&
          board[row - 2][col + 2] === value && board[row - 3][col + 3] === value) {
        return true;
      }
    }
  }
  return false;
}

// Check if board is full
function isFull(board) {
  return board[0].every(cell => cell !== 0);
}

// Get list of valid columns to move in
function getValidMoves(board) {
  const moves = [];
  for (let col = 0; col < COLS; col++) {
    if (board[0][col] === 0) moves.push(col);
  }
  return moves;
}

// Simulate making a move and return new board
function makeMove(board, col, value) {
  const newBoard = board.map(row => [...row]);
  for (let row = ROWS - 1; row >= 0; row--) {
    if (newBoard[row][col] === 0) {
      newBoard[row][col] = value;
      break;
    }
  }
  return newBoard;
}

module.exports = { botMove };
