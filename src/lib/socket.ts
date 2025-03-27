import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth';

// Pending updates queue
let pendingUpdates: any[] = [];

// Determine the server URL dynamically
export const getServerUrl = (): string => {
  // Use the current hostname but force port 5173 for the server
  const hostname = window.location.hostname;
  return `http://${hostname}:5173`;
};

// Create socket with better connection options
export const socket: Socket = io(getServerUrl(), {
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ['websocket', 'polling'] // Try WebSocket first, fallback to polling
});

// Enhanced logging
console.log('Connecting to Socket.IO server at:', getServerUrl());

socket.on('connect', () => {
  console.log('Connected to real-time server with ID:', socket.id);
  
  // Register this client with user info
  const user = useAuthStore.getState().user;
  socket.emit('register_client', {
    userId: user?.id || 'anonymous',
    role: user?.role || 'unknown',
    teamId: user?.teamId || null  // Changed 'team' to 'teamId' to match User type
  });
  
  // Send any pending updates
  if (pendingUpdates.length > 0) {
    console.log(`Sending ${pendingUpdates.length} pending updates`);
    pendingUpdates.forEach(update => {
      socket.emit('auction_update', update);
    });
    pendingUpdates = [];
  }
});

socket.on('client_joined', (data) => {
  console.log('New client joined:', data);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Reconnection attempt ${attemptNumber}`);
});

// Function to broadcast auction updates
export const broadcastAuctionUpdate = (data: any) => {
  console.log('Broadcasting update:', data);
  
  if (socket.connected) {
    socket.emit('auction_update', data);
  } else {
    console.warn('Socket not connected - queueing update');
    pendingUpdates.push(data);
    
    // Try to reconnect if disconnected
    if (!socket.connected) {  // Changed from 'connecting' to check 'connected' state
      socket.connect();  // Use connect() method to initiate connection
    }
  }
};