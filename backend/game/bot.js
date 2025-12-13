// Minimax bot for Connect Four with alpha-beta pruning
// Assumes board is a 2D array [row][col], 6x7, with 'R', 'Y', or null
// botColor: 'R' or 'Y', opponentColor: 'Y' or 'R'

const ROWS = 6;
const COLS = 7;
const MAX_DEPTH = 6;

function getValidMoves(board) {
  const moves = [];
  for (let col = 0; col < COLS; col++) {
    if (!board[0][col]) moves.push(col);
  }
  return moves;
}

function makeMove(board, col, color) {
  const newBoard = board.map(row => row.slice());
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!newBoard[row][col]) {
      newBoard[row][col] = color;
      break;
    }
  }
  return newBoard;
}

function checkWin(board, color) {
  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (
        board[row][col] === color &&
        board[row][col + 1] === color &&
        board[row][col + 2] === color &&
        board[row][col + 3] === color
      ) return true;
    }
  }
  // Vertical
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row <= ROWS - 4; row++) {
      if (
        board[row][col] === color &&
        board[row + 1][col] === color &&
        board[row + 2][col] === color &&
        board[row + 3][col] === color
      ) return true;
    }
  }
  // Diagonal (bottom left to top right)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (
        board[row][col] === color &&
        board[row - 1][col + 1] === color &&
        board[row - 2][col + 2] === color &&
        board[row - 3][col + 3] === color
      ) return true;
    }
  }
  // Diagonal (top left to bottom right)
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      if (
        board[row][col] === color &&
        board[row + 1][col + 1] === color &&
        board[row + 2][col + 2] === color &&
        board[row + 3][col + 3] === color
      ) return true;
    }
  }
  return false;
}

function isDraw(board) {
  return board[0].every(cell => cell);
}

function evaluateWindow(window, botColor, opponentColor) {
  let score = 0;
  const botCount = window.filter(cell => cell === botColor).length;
  const oppCount = window.filter(cell => cell === opponentColor).length;
  const emptyCount = window.filter(cell => !cell).length;

  if (botCount === 4) score += 100000;
  else if (botCount === 3 && emptyCount === 1) score += 100;
  else if (botCount === 2 && emptyCount === 2) score += 10;

  if (oppCount === 3 && emptyCount === 1) score -= 80;
  if (oppCount === 4) score -= 100000;

  return score;
}

function scorePosition(board, botColor, opponentColor) {
  let score = 0;
  // Center column preference
  const centerArray = [];
  for (let row = 0; row < ROWS; row++) centerArray.push(board[row][Math.floor(COLS/2)]);
  score += centerArray.filter(cell => cell === botColor).length * 6;

  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const window = [board[row][col], board[row][col+1], board[row][col+2], board[row][col+3]];
      score += evaluateWindow(window, botColor, opponentColor);
    }
  }
  // Vertical
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row <= ROWS - 4; row++) {
      const window = [board[row][col], board[row+1][col], board[row+2][col], board[row+3][col]];
      score += evaluateWindow(window, botColor, opponentColor);
    }
  }
  // Diagonal /
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const window = [board[row][col], board[row-1][col+1], board[row-2][col+2], board[row-3][col+3]];
      score += evaluateWindow(window, botColor, opponentColor);
    }
  }
  // Diagonal \
  for (let row = 0; row <= ROWS - 4; row++) {
    for (let col = 0; col <= COLS - 4; col++) {
      const window = [board[row][col], board[row+1][col+1], board[row+2][col+2], board[row+3][col+3]];
      score += evaluateWindow(window, botColor, opponentColor);
    }
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizingPlayer, botColor, opponentColor) {
  const validMoves = getValidMoves(board);
  const isTerminal = checkWin(board, botColor) || checkWin(board, opponentColor) || isDraw(board);
  if (depth === 0 || isTerminal) {
    if (checkWin(board, botColor)) return [null, 1000000];
    if (checkWin(board, opponentColor)) return [null, -1000000];
    if (isDraw(board)) return [null, 0];
    return [null, scorePosition(board, botColor, opponentColor)];
  }
  if (maximizingPlayer) {
    let value = -Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, botColor);
      const [_, newScore] = minimax(newBoard, depth - 1, alpha, beta, false, botColor, opponentColor);
      if (newScore > value) {
        value = newScore;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  } else {
    let value = Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, opponentColor);
      const [_, newScore] = minimax(newBoard, depth - 1, alpha, beta, true, botColor, opponentColor);
      if (newScore < value) {
        value = newScore;
        bestCol = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  }
}

function getBestMove(board, botColor) {
  const opponentColor = botColor === 'R' ? 'Y' : 'R';
  const [bestCol] = minimax(board, MAX_DEPTH, -Infinity, Infinity, true, botColor, opponentColor);
  return bestCol;
}

module.exports = { getBestMove };
