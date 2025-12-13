import React from 'react';

const ROWS = 6;
const COLS = 7;

function getCellColor(cell) {
  if (cell === 'R') return 'bg-red-500';
  if (cell === 'Y') return 'bg-yellow-400';
  return 'bg-gray-300';
}

export default function GameBoard({ board, currentTurn, status, winner, onMove, myColor }) {
  // Reverse rows for bottom-up display
  const displayBoard = [...board].reverse();

  const handleMove = (col) => {
    if (status !== 'playing') return;
    if (onMove) onMove(col);
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="mb-4 text-lg font-semibold">
        {status === 'finished' ? (
          winner ? (
            <span className={winner === 'R' ? 'text-red-500' : 'text-yellow-500'}>
              {winner === myColor ? 'You win!' : 'You lose!'}
            </span>
          ) : (
            <span className="text-gray-700">Draw!</span>
          )
        ) : (
          <span>
            Turn: <span className={currentTurn === 0 ? 'text-red-500' : 'text-yellow-500'}>
              {currentTurn === 0 ? 'Red' : 'Yellow'}
            </span>
          </span>
        )}
      </div>
      <div className="grid grid-rows-6 grid-cols-7 gap-2 bg-blue-700 p-4 rounded-lg shadow-lg">
        {displayBoard.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={rIdx + '-' + cIdx}
              className={`w-12 h-12 flex items-center justify-center rounded-full ${getCellColor(cell)} shadow-inner`}
            />
          ))
        )}
      </div>
      <div className="flex mt-4 gap-2">
        {Array.from({ length: COLS }).map((_, col) => (
          <button
            key={col}
            className="w-12 h-10 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            onClick={() => handleMove(col)}
            disabled={status !== 'playing' || board[0][col]}
          >
            ▼
          </button>
        ))}
      </div>
    </div>
  );
}
