
import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import WaitingScreen from './components/WaitingScreen.jsx';
import GameBoard from './components/GameBoard.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import { connectSocket, disconnectSocket } from './socket.js';

export default function App() {
  const [username, setUsername] = useState('');
  const [gameState, setGameState] = useState(null);
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('login'); // 'login', 'waiting', 'playing'

  // Handle login and socket connection
  const handleJoin = (name) => {
    setUsername(name);
    const sock = connectSocket();
    setSocket(sock);
    sock.emit('joinQueue', { username: name });
    setStatus('waiting');
    // Socket event listeners
    sock.on('waiting', () => setStatus('waiting'));
    sock.on('gameStart', (data) => {
      setGameState(data);
      setStatus('playing');
    });
    sock.on('gameUpdate', (data) => {
      setGameState((prev) => ({ ...prev, ...data }));
    });
    sock.on('gameOver', (data) => {
      setGameState((prev) => ({ ...prev, ...data, status: 'finished' }));
    });
  };

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) disconnectSocket(socket);
    };
  }, [socket]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">4 in a Row</h1>
        {username && <span className="app-username">{username}</span>}
      </header>
      <main className="app-main">
        {!username ? (
          <Login onJoin={handleJoin} />
        ) : status === 'waiting' ? (
          <WaitingScreen />
        ) : (
          <>
            <div className="game-section">
              <GameBoard gameState={gameState} socket={socket} currentUser={username} />
            </div>
            <div className="leaderboard-section">
              <Leaderboard />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
