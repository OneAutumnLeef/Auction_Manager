import { socket } from '../lib/socket';

// Function to display status in UI console (can be called from browser console)
export const testConnection = () => {
  console.log('Connection status:', socket.connected ? 'Connected' : 'Disconnected');
  
  if (socket.connected) {
    console.log('Socket ID:', socket.id);
    return 'Connected to server with ID: ' + socket.id;
  } else {
    return 'Not connected to server';
  }
};

// Function to send a test message (can be called from browser console)
export const testBroadcast = (message = 'Test message') => {
  if (!socket.connected) {
    console.warn('Cannot broadcast - not connected to server');
    return 'Failed: Not connected to server';
  }
  
  const testData = {
    type: 'TEST_MESSAGE',
    message,
    timestamp: new Date().toISOString()
  };
  
  console.log('Sending test broadcast:', testData);
  socket.emit('auction_update', testData);
  return 'Test message sent';
};

// Listen for test messages
socket.on('auction_update', (data) => {
  if (data.type === 'TEST_MESSAGE') {
    console.log('%c Received test message:', 'background: #4CAF50; color: white; padding: 4px;', data);
  }
});

// Make these functions available globally for testing from browser console
if (typeof window !== 'undefined') {
  (window as any).testSocketConnection = testConnection;
  (window as any).testSocketBroadcast = testBroadcast;
}