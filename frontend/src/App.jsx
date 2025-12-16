import React, { useState, useEffect } from 'react';
import { connectSocket, disconnectSocket } from './socket.js';
import WaitingScreen from './components/WaitingScreen';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState({ player1: '', player2: '' });
  const [gameMode, setGameMode] = useState('local'); // 'local', 'online', 'vsBot'
  const [currentScreen, setCurrentScreen] = useState('setup'); // 'setup', 'game', 'waiting'
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState('');

  const initializeGame = () => {
    if (gameMode === 'vsBot') {
      // Connect to backend for vsBot game
      const newSocket = connectSocket();
      setSocket(newSocket);
      setCurrentUser(players.player1 || 'Player 1');
      
      // Set up socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to server');
      });
      
      newSocket.on('gameStart', (data) => {
        console.log('Game started:', data);
        setGameState(data);
        setCurrentScreen('game');
      });
      
      newSocket.on('gameUpdate', (data) => {
        console.log('Game update received:', data);
        setGameState(data);
      });
      
      newSocket.on('gameOver', (data) => {
        console.log('Game over:', data);
        setGameState(data);
      });
      
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        alert('Connection error: ' + (error.message || JSON.stringify(error)));
      });
      
      // Create vsBot game
      newSocket.emit('joinQueue', {
        username: players.player1 || 'Player 1',
        gameType: 'vsBot'
      });
      
      setCurrentScreen('waiting');
    } else {
      // Local game
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
    }
  };

  const handleCellClick = (col) => {
    if (gameMode === 'vsBot' && socket) {
      // Send move to backend
      socket.emit('makeMove', { gameId: gameState.gameId, column: col });
    } else if (gameMode === 'local') {
      // Local game logic
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
    }
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
    if (socket) {
      disconnectSocket(socket);
      setSocket(null);
    }
    setGameState(null);
    setCurrentScreen('setup');
  };

  return (
    <div className="app">
      <div className="assignment-info">
        <h1>EMITTR - Assignment</h1>
        <p className="subtitle">By Chandra Shekhar (HBTU Kanpur)</p>
        <h2 className="game-title">4 in a Row Game</h2>
        <div className="game-rules">
          <p><strong>Rules:</strong> Players take turns dropping colored discs into a grid. The first to connect 4 discs in a row (horizontally, vertically, or diagonally) wins!</p>
        </div>
      </div>

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

        {currentScreen === 'waiting' && <WaitingScreen />}

        {currentScreen === 'game' && gameState && (
          <div className="game-screen">
            {gameMode === 'vsBot' ? (
              <GameBoard 
                gameState={gameState}
                socket={socket}
                currentUser={currentUser}
                onReset={resetGame}
              />
            ) : (
              <GameBoard 
                gameState={gameState}
                onCellClick={handleCellClick}
                onReset={resetGame}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function GameBoard({ gameState, onCellClick, socket, currentUser, onReset }) {
  const renderCell = (row, col) => {
    const cellValue = gameState.board[row][col];
    let cellClass = 'cell';
    
    if (cellValue === 'R') cellClass += ' red';
    else if (cellValue === 'Y') cellClass += ' yellow';
    
    return <div key={`${row}-${col}`} className={cellClass}></div>;
  };

  const handleColumnClick = (col) => {
    console.log('Column clicked:', col, 'isMyTurn:', isMyTurn(), 'currentPlayer:', gameState.currentPlayer, 'currentUser:', currentUser);
    if (socket) {
      // Socket-based game
      console.log('Sending makeMove to backend for game:', gameState.gameId);
      socket.emit('makeMove', { gameId: gameState.gameId, column: col });
    } else if (onCellClick) {
      // Local game
      onCellClick(col);
    }
  };

  const getStatusMessage = () => {
    if (gameState.status === 'finished' || gameState.gameStatus === 'finished') {
      if (gameState.winner === null) return "Game Draw!";
      if (gameState.players && gameState.players.player1 && gameState.players.player2) {
        const winnerName = gameState.winner === 'player1' 
          ? gameState.players.player1.username 
          : gameState.players.player2.username;
        return `${winnerName} Wins!`;
      }
      return "Game Over!";
    }
    if (gameState.status === 'playing' || gameState.gameStatus === 'playing') {
      if (gameState.players && gameState.players.player1 && gameState.players.player2) {
        const currentPlayerName = gameState.currentPlayer === 'player1' 
          ? gameState.players.player1.username 
          : gameState.players.player2.username;
        return `${currentPlayerName}'s Turn`;
      }
      return "Game in progress";
    }
    return "Waiting...";
  };

  const getCurrentIndicator = () => {
    if (gameState.currentPlayer === 'player1') return 'red';
    return 'yellow';
  };

  const isMyTurn = () => {
    if (!socket || !currentUser) return true; // Local game
    if (gameState.players && gameState.players.player1 && gameState.players.player2) {
      const currentPlayerName = gameState.currentPlayer === 'player1' 
        ? gameState.players.player1.username 
        : gameState.players.player2.username;
      const result = currentPlayerName === currentUser;
      console.log('isMyTurn check:', 'currentPlayer:', gameState.currentPlayer, 'currentPlayerName:', currentPlayerName, 'currentUser:', currentUser, 'result:', result);
      return result;
    }
    console.log('isMyTurn: no players data');
    return false;
  };

  return (
    <div className="game-container">
      <div className="game-info">
        <div className="player-display player-1">
          <div className="player-color red"></div>
          <div className="player-name">
            {gameState.players?.player1?.username || gameState.players?.player1?.name || 'Player 1'}
          </div>
          <div className="player-label">Player 1</div>
        </div>
        
        <div className="game-status">
          <div className={`turn-indicator ${getCurrentIndicator()}`}></div>
          <div className="status-message">{getStatusMessage()}</div>
        </div>
        
        <div className="player-display player-2">
          <div className="player-color yellow"></div>
          <div className="player-name">
            {gameState.players?.player2?.username || gameState.players?.player2?.name || 'Player 2'}
          </div>
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
              onClick={() => handleColumnClick(col)}
              disabled={!isMyTurn() || (gameState.status !== 'playing' && gameState.gameStatus !== 'playing')}
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
          Moves: {gameState.moves ? gameState.moves.length : 0}
        </div>
      </div>
    </div>
  );
}

export default App;