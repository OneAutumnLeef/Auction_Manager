import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 30000,
  pingInterval: 10000
});

// Serve static files from the dist directory after building
app.use(express.static(path.join(__dirname, 'dist')));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Keep track of connected clients
  socket.on('register_client', (userData) => {
    console.log(`Client registered: ${socket.id}`, userData);
    // Let others know someone joined (optional)
    socket.broadcast.emit('client_joined', {
      socketId: socket.id,
      userData
    });
  });
  
  // When a client updates auction state
  socket.on('auction_update', (data) => {
    console.log('Received update from', socket.id, 'broadcasting to others');
    
    // Add source info and broadcast to all OTHER clients
    const enhancedData = {
      ...data,
      _source: socket.id,
      _timestamp: new Date().toISOString()
    };
    
    socket.broadcast.emit('auction_update', enhancedData);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Fallback route - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Set port with fallback
const PORT = process.env.PORT || 5173;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Local network access: http://_ADDRESS:${PORT}`);
});