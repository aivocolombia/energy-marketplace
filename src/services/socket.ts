import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Conectado al servidor de Socket.IO');
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión Socket.IO:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado del servidor:', reason);
});

export default socket; 