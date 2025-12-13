import { io } from 'socket.io-client';

export function connectSocket() {
  const socket = io('http://localhost:5000');
  return socket;
}

export function disconnectSocket(socket) {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
