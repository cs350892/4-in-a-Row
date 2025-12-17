import { io } from 'socket.io-client';

export function connectSocket() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const socket = io(backendUrl, {
    timeout: 60000,  // 60 second connection timeout
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    forceNew: true
  });
  return socket;
}

export function disconnectSocket(socket) {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
