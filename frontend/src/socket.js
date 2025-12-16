import { io } from 'socket.io-client';

export function connectSocket() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const socket = io(backendUrl, {
    transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    timeout: 5000, // 5 second connection timeout
    forceNew: true, // Force new connection
    reconnection: true, // Enable reconnection
    reconnectionAttempts: 3, // Try to reconnect 3 times
    reconnectionDelay: 1000, // Wait 1 second between reconnection attempts
  });

  // Connection event handlers for debugging
  socket.on('connect', () => {
    console.log('✅ Socket connected successfully:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🚨 Socket connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('🚨 Socket error:', error);
  });

  return socket;
}

export function disconnectSocket(socket) {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
