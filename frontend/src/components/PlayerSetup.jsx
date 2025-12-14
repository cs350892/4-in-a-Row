import React, { useState } from 'react';

function PlayerSetup({ onStartGame }) {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [gameMode, setGameMode] = useState('local');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (player1.trim()) {
      onStartGame({
        player1: player1.trim(),
        player2: gameMode === 'local' ? player2.trim() : 'Computer',
        mode: gameMode
      });
    }
  };

  return (
    <div className="player-setup">
      <h2>Game Setup</h2>
      <form onSubmit={handleSubmit} className="setup-form">
        <div className="mode-selection">
          <button
            type="button"
            className={`mode-btn ${gameMode === 'local' ? 'active' : ''}`}
            onClick={() => {
              setGameMode('local');
              if (!player2) setPlayer2('Player 2');
            }}
          >
            👥 Local 2-Player
          </button>
          <button
            type="button"
            className={`mode-btn ${gameMode === 'vsBot' ? 'active' : ''}`}
            onClick={() => {
              setGameMode('vsBot');
              setPlayer2('Computer');
            }}
          >
            🤖 vs Computer
          </button>
        </div>

        <div className="player-inputs">
          <div className="input-group">
            <label htmlFor="player1">Player 1 (Red) *</label>
            <input
              id="player1"
              type="text"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              placeholder="Enter Player 1 name"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="player2">Player 2 (Yellow)</label>
            <input
              id="player2"
              type="text"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              placeholder={gameMode === 'vsBot' ? 'Computer' : 'Enter Player 2 name'}
              disabled={gameMode === 'vsBot'}
              required={gameMode === 'local'}
            />
          </div>
        </div>

        <button type="submit" className="start-game-btn" disabled={!player1.trim()}>
          Start Game
        </button>
      </form>
    </div>
  );
}

export default PlayerSetup;