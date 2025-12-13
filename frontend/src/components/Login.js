import React, { useState } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io(); // Assumes proxy is set in package.json

export default function Login({ onGameStart }) {
  const [username, setUsername] = useState('');
  const [waiting, setWaiting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = uuidv4();
    socket.emit('joinQueue', { username, id });
    setWaiting(true);
  };

  React.useEffect(() => {
    socket.on('gameStart', (data) => {
      setWaiting(false);
      if (onGameStart) onGameStart(data, socket);
    });
    socket.on('waiting', () => setWaiting(true));
    return () => {
      socket.off('gameStart');
      socket.off('waiting');
    };
  }, [onGameStart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Connect Four Login</h2>
        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700"
          disabled={waiting}
        >
          Join Queue
        </button>
        {waiting && (
          <div className="mt-4 text-center text-gray-600">Waiting for opponent...</div>
        )}
      </form>
    </div>
  );
}
