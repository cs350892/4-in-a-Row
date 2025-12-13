import React from 'react';

const ROWS = 6;
const COLS = 7;

function getCellColor(cell) {
  if (cell === 'R') return 'bg-red-500';
  if (cell === 'Y') return 'bg-yellow-400';
  return 'bg-gray-300';
}

export default function GameBoard({ gameState, socket, currentUser }) {
  if (!gameState) return null;
  const { board, currentTurn, status, winner, players, gameId } = gameState;
  // Reverse rows for bottom-up display
  const displayBoard = [...board].reverse();

  // Determine player color
  const myColor = players && players[0] && players[0].username === currentUser ? 'R' : 'Y';
  const isMyTurn = status === 'playing' && ((myColor === 'R' && currentTurn === 0) || (myColor === 'Y' && currentTurn === 1));

  let statusText = '';
  if (status === 'waiting') statusText = 'Waiting for opponent...';
  else if (status === 'finished') {
    if (winner === null) statusText = 'Draw!';
    else if (players && players[currentTurn] && players[currentTurn].username === currentUser) statusText = 'You Win!';
    else statusText = 'You Lose';
  } else {
    statusText = isMyTurn ? 'Your turn' : "Opponent's turn";
  }

  const handleMove = (col) => {
    if (isMyTurn && status === 'playing') {
      socket.emit('makeMove', { gameId, column: col });
    }
  };

  return (
    <div className="gameboard-container">
      <div className="gameboard-status">{statusText}</div>
      <div className="gameboard-grid">
        {displayBoard.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={rIdx + '-' + cIdx}
              className={`gameboard-cell ${getCellColor(cell)}`}
            />
          ))
        )}
      </div>
      <div className="gameboard-controls">
        {Array.from({ length: COLS }).map((_, col) => (
          <button
            key={col}
            className="gameboard-btn"
            onClick={() => handleMove(col)}
            disabled={!isMyTurn || status !== 'playing' || board[0][col]}
          >
            {col + 1}
          </button>
        ))}
      </div>
      {status === 'finished' && (
        <div className="gameboard-finish-status">{statusText}</div>
      )}
    </div>
  );
}
