class Player {
  constructor(id, username, color = 'red') {
    this.id = id;
    this.username = username;
    this.color = color;
  }
}

class Game {
  constructor(gameId, player1) {
    this.gameId = gameId;
    // 6 rows, 7 columns, filled with 0 (empty)
    this.board = Array(6).fill().map(() => Array(7).fill(0));
    this.players = [player1, null];
    this.currentTurn = 0; // 0 for player1, 1 for player2
    this.status = 'waiting'; // 'waiting', 'playing', 'finished'
    this.winner = null;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
  }

  // Add the second player and start the game
  addSecondPlayer(player2) {
    this.players[1] = player2;
    this.status = 'playing';
  }

  // Make a move for the given player index in the specified column
  // Returns true if move was successful, false otherwise
  makeMove(playerIndex, column) {
    if (this.status !== 'playing' || playerIndex !== this.currentTurn) return false;
    const row = this.findLowestRow(column);
    if (row === -1) return false;
    // Place the player's piece (1 for player1, 2 for player2)
    this.board[row][column] = playerIndex + 1;
    this.lastActivity = Date.now();
    if (this.checkWin(playerIndex + 1)) {
      this.status = 'finished';
      this.winner = this.players[playerIndex];
    } else if (this.isFull()) {
      this.status = 'finished';
      this.winner = null; // draw
    } else {
      this.currentTurn = 1 - this.currentTurn;
    }
    return true;
  }

  // Find the lowest available row in the given column
  findLowestRow(column) {
    for (let row = 5; row >= 0; row--) {
      if (this.board[row][column] === 0) return row;
    }
    return -1; // column is full
  }

  // Check if the given player value has won (horizontal, vertical, diagonal)
  checkWin(playerValue) {
    // Horizontal check
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        if (
          this.board[row][col] === playerValue &&
          this.board[row][col + 1] === playerValue &&
          this.board[row][col + 2] === playerValue &&
          this.board[row][col + 3] === playerValue
        ) {
          return true;
        }
      }
    }
    // Vertical check
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= 2; row++) {
        if (
          this.board[row][col] === playerValue &&
          this.board[row + 1][col] === playerValue &&
          this.board[row + 2][col] === playerValue &&
          this.board[row + 3][col] === playerValue
        ) {
          return true;
        }
      }
    }
    // Diagonal (top-left to bottom-right)
    for (let row = 0; row <= 2; row++) {
      for (let col = 0; col <= 3; col++) {
        if (
          this.board[row][col] === playerValue &&
          this.board[row + 1][col + 1] === playerValue &&
          this.board[row + 2][col + 2] === playerValue &&
          this.board[row + 3][col + 3] === playerValue
        ) {
          return true;
        }
      }
    }
    // Diagonal (bottom-left to top-right)
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        if (
          this.board[row][col] === playerValue &&
          this.board[row - 1][col + 1] === playerValue &&
          this.board[row - 2][col + 2] === playerValue &&
          this.board[row - 3][col + 3] === playerValue
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Check if the board is full (for draw)
  isFull() {
    return this.board.every(row => row.every(cell => cell !== 0));
  }
}

module.exports = { Player, Game };
