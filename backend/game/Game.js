class Player {
  constructor(id, username, color) {
    this.id = id;
    this.username = username;
    this.color = color; // e.g., 'red' or 'yellow'
  }
}

class Game {
  constructor(player1, player2) {
    this.rows = 6;
    this.cols = 7;
    this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.players = [player1, player2];
    this.currentTurn = 0; // 0 or 1
    this.status = 'waiting'; // 'waiting', 'playing', 'finished'
    this.winner = null;
  }

  makeMove(column) {
    if (this.status !== 'playing') return false;
    const row = this.findLowestRow(column);
    if (row === -1) return false;
    const player = this.players[this.currentTurn];
    this.board[row][column] = player.color;
    if (this.checkWin(player)) {
      this.status = 'finished';
      this.winner = player;
    } else if (this.isDraw()) {
      this.status = 'finished';
      this.winner = null;
    } else {
      this.currentTurn = 1 - this.currentTurn;
    }
    return true;
  }

  findLowestRow(column) {
    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[row][column]) return row;
    }
    return -1;
  }

  checkWin(player) {
    const color = player.color;
    // Horizontal
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col <= this.cols - 4; col++) {
        if (
          this.board[row][col] === color &&
          this.board[row][col + 1] === color &&
          this.board[row][col + 2] === color &&
          this.board[row][col + 3] === color
        ) {
          return true;
        }
      }
    }
    // Vertical
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row <= this.rows - 4; row++) {
        if (
          this.board[row][col] === color &&
          this.board[row + 1][col] === color &&
          this.board[row + 2][col] === color &&
          this.board[row + 3][col] === color
        ) {
          return true;
        }
      }
    }
    // Diagonal (bottom left to top right)
    for (let row = 3; row < this.rows; row++) {
      for (let col = 0; col <= this.cols - 4; col++) {
        if (
          this.board[row][col] === color &&
          this.board[row - 1][col + 1] === color &&
          this.board[row - 2][col + 2] === color &&
          this.board[row - 3][col + 3] === color
        ) {
          return true;
        }
      }
    }
    // Diagonal (top left to bottom right)
    for (let row = 0; row <= this.rows - 4; row++) {
      for (let col = 0; col <= this.cols - 4; col++) {
        if (
          this.board[row][col] === color &&
          this.board[row + 1][col + 1] === color &&
          this.board[row + 2][col + 2] === color &&
          this.board[row + 3][col + 3] === color
        ) {
          return true;
        }
      }
    }
    return false;
  }

  isDraw() {
    return this.board.every(row => row.every(cell => cell));
  }
}

module.exports = { Player, Game };
