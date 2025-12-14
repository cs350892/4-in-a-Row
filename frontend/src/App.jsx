import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState({ player1: '', player2: '' });
  const [gameMode, setGameMode] = useState('local'); // 'local', 'online', 'vsBot'
  const [currentScreen, setCurrentScreen] = useState('setup'); // 'setup', 'game', 'waiting'

  const initializeGame = () => {
    const newGameState = {
      board: Array(6).fill().map(() => Array(7).fill(null)),
      currentPlayer: 'player1',
      gameStatus: 'playing',
      winner: null,
      players: {
        player1: { name: players.player1 || 'Player 1', color: 'red' },
        player2: { 
          name: players.player2 || (gameMode === 'vsBot' ? 'Computer' : 'Player 2'), 
          color: 'yellow' 
        }
      },
      moves: []
    };
    setGameState(newGameState);
    setCurrentScreen('game');
  };

  const handleCellClick = (col) => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    const newBoard = [...gameState.board];
    let rowToPlace = -1;
    
    // Find the lowest empty row in the column
    for (let row = 5; row >= 0; row--) {
      if (!newBoard[row][col]) {
        rowToPlace = row;
        break;
      }
    }
    
    if (rowToPlace === -1) return; // Column is full
    
    // Place the disk
    newBoard[rowToPlace][col] = gameState.currentPlayer === 'player1' ? 'R' : 'Y';
    
    // Check for win
    const winner = checkWinner(newBoard, rowToPlace, col);
    const isDraw = checkDraw(newBoard);
    
    const updatedGameState = {
      ...gameState,
      board: newBoard,
      moves: [...gameState.moves, { player: gameState.currentPlayer, col, row: rowToPlace }]
    };
    
    if (winner) {
      updatedGameState.winner = winner;
      updatedGameState.gameStatus = 'finished';
    } else if (isDraw) {
      updatedGameState.gameStatus = 'draw';
    } else {
      // Switch player
      updatedGameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
    }
    
    setGameState(updatedGameState);
  };

  const checkWinner = (board, row, col) => {
    const player = board[row][col];
    
    // Horizontal check
    let count = 0;
    for (let c = 0; c < 7; c++) {
      count = board[row][c] === player ? count + 1 : 0;
      if (count >= 4) return player === 'R' ? 'player1' : 'player2';
    }
    
    // Vertical check
    count = 0;
    for (let r = 0; r < 6; r++) {
      count = board[r][col] === player ? count + 1 : 0;
      if (count >= 4) return player === 'R' ? 'player1' : 'player2';
    }
    
    // Diagonal down-right
    count = 0;
    for (let r = row, c = col; r >= 0 && c >= 0; r--, c--) {
      if (board[r][c] === player) count++;
      else break;
    }
    for (let r = row + 1, c = col + 1; r < 6 && c < 7; r++, c++) {
      if (board[r][c] === player) count++;
      else break;
    }
    if (count >= 4) return player === 'R' ? 'player1' : 'player2';
    
    // Diagonal down-left
    count = 0;
    for (let r = row, c = col; r >= 0 && c < 7; r--, c++) {
      if (board[r][c] === player) count++;
      else break;
    }
    for (let r = row + 1, c = col - 1; r < 6 && c >= 0; r++, c--) {
      if (board[r][c] === player) count++;
      else break;
    }
    if (count >= 4) return player === 'R' ? 'player1' : 'player2';
    
    return null;
  };

  const checkDraw = (board) => {
    return board[0].every(cell => cell !== null);
  };

  const resetGame = () => {
    setGameState(null);
    setCurrentScreen('setup');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Connect Four</h1>
        <p className="subtitle">4 in a Row Game</p>
      </header>

      <main className="app-main">
        {currentScreen === 'setup' && (
          <div className="setup-screen">
            <div className="setup-card">
              <h2>Game Setup</h2>
              
              <div className="mode-selection">
                <button 
                  className={`mode-btn ${gameMode === 'local' ? 'active' : ''}`}
                  onClick={() => setGameMode('local')}
                >
                  👥 Local Multiplayer
                </button>
                <button 
                  className={`mode-btn ${gameMode === 'vsBot' ? 'active' : ''}`}
                  onClick={() => setGameMode('vsBot')}
                >
                  🤖 vs Computer
                </button>
              </div>

              <div className="player-inputs">
                <div className="input-group">
                  <label>Player 1 Name (Red)</label>
                  <input
                    type="text"
                    value={players.player1}
                    onChange={(e) => setPlayers({...players, player1: e.target.value})}
                    placeholder="Enter Player 1 name"
                  />
                </div>
                
                <div className="input-group">
                  <label>Player 2 Name (Yellow)</label>
                  <input
                    type="text"
                    value={players.player2}
                    onChange={(e) => setPlayers({...players, player2: e.target.value})}
                    placeholder={gameMode === 'vsBot' ? "Computer" : "Enter Player 2 name"}
                    disabled={gameMode === 'vsBot'}
                  />
                  {gameMode === 'vsBot' && (
                    <span className="bot-note">Computer will play as Player 2</span>
                  )}
                </div>
              </div>

              <button 
                className="start-btn"
                onClick={initializeGame}
                disabled={!players.player1.trim()}
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {currentScreen === 'game' && gameState && (
          <div className="game-screen">
            <GameBoard 
              gameState={gameState}
              onCellClick={handleCellClick}
              onReset={resetGame}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function GameBoard({ gameState, onCellClick, onReset }) {
  const renderCell = (row, col) => {
    const cellValue = gameState.board[row][col];
    let cellClass = 'cell';
    
    if (cellValue === 'R') cellClass += ' red';
    else if (cellValue === 'Y') cellClass += ' yellow';
    
    return <div key={`${row}-${col}`} className={cellClass}></div>;
  };

  const getStatusMessage = () => {
    if (gameState.gameStatus === 'finished') {
      const winnerName = gameState.winner === 'player1' 
        ? gameState.players.player1.name 
        : gameState.players.player2.name;
      return `${winnerName} Wins!`;
    }
    if (gameState.gameStatus === 'draw') {
      return "Game Draw!";
    }
    const currentPlayer = gameState.currentPlayer === 'player1' 
      ? gameState.players.player1 
      : gameState.players.player2;
    return `${currentPlayer.name}'s Turn`;
  };

  const getCurrentIndicator = () => {
    return gameState.currentPlayer === 'player1' ? 'red' : 'yellow';
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="player-display player-1">
          <div className="player-color red"></div>
          <div className="player-name">{gameState.players.player1.name}</div>
          <div className="player-label">Player 1</div>
        </div>
        
        <div className="game-status">
          <div className={`turn-indicator ${getCurrentIndicator()}`}></div>
          <div className="status-message">{getStatusMessage()}</div>
        </div>
        
        <div className="player-display player-2">
          <div className="player-color yellow"></div>
          <div className="player-name">{gameState.players.player2.name}</div>
          <div className="player-label">Player 2</div>
        </div>
      </div>

      <div className="board-container">
        <div className="board">
          {gameState.board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
            </div>
          ))}
        </div>
        
        <div className="column-buttons">
          {Array(7).fill().map((_, col) => (
            <button
              key={col}
              className="column-btn"
              onClick={() => onCellClick(col)}
              disabled={gameState.gameStatus !== 'playing'}
              title={`Drop in column ${col + 1}`}
            >
              ↓
            </button>
          ))}
        </div>
      </div>

      <div className="game-controls">
        <button className="reset-btn" onClick={onReset}>
          New Game
        </button>
        <div className="moves-counter">
          Moves: {gameState.moves.length}
        </div>
      </div>
    </div>
  );
}

export default App;