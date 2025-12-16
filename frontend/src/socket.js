import { io } from 'socket.io-client';

export function connectSocket() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const socket = io(backendUrl);
  return socket;
}

export function disconnectSocket(socket) {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
