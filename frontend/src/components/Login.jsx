import React, { useState } from 'react';

export default function Login({ onJoin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim());
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">4 in a Row</h1>
        <input
          type="text"
          className="login-input"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          Join Game
        </button>
      </form>
    </div>
  );
}
