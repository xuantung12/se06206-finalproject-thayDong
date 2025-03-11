const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// Initialize express app and server
const app = express();
app.use(cors());
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Game rooms data structure
const rooms = new Map();

// Initial board state (copied from client-side)
const initialBoardState = [
  ["車", "馬", "象", "士", "將", "士", "象", "馬", "車"],
  [null, null, null, null, null, null, null, null, null],
  [null, "砲", null, null, null, null, null, "砲", null],
  ["兵", null, "兵", null, "兵", null, "兵", null, "兵"],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  ["卒", null, "卒", null, "卒", null, "卒", null, "卒"],
  [null, "炮", null, null, null, null, null, "炮", null],
  [null, null, null, null, null, null, null, null, null],
  ["车", "马", "相", "仕", "帅", "仕", "相", "马", "车"],
];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create a new game room
  socket.on('createRoom', ({ color }) => {
    const roomId = uuidv4().substring(0, 8); // Create a shorter room ID for convenience
    
    // Initialize room data
    rooms.set(roomId, {
      players: {
        [socket.id]: {
          id: socket.id,
          color: color,
          ready: true
        }
      },
      board: JSON.parse(JSON.stringify(initialBoardState)), // Deep copy the initial board
      currentTurn: 'red',
      gameStarted: false,
      messages: [],
      timers: {
        redTotal: 600, // 10 minutes in seconds
        blackTotal: 600,
        redMove: 120, // 2 minutes per move
        blackMove: 120
      }
    });
    
    // Join the room
    socket.join(roomId);
    
    // Notify the client
    socket.emit('roomCreated', { roomId, color });
    
    console.log(`Room created: ${roomId}, Player color: ${color}`);
  });

  // Join an existing game room
  socket.on('joinRoom', ({ roomId }) => {
    // Check if room exists
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const room = rooms.get(roomId);
    
    // Check if room is full
    if (Object.keys(room.players).length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    
    // Determine the player's color (opposite of existing player)
    const existingPlayer = Object.values(room.players)[0];
    const color = existingPlayer.color === 'red' ? 'black' : 'red';
    
    // Add player to room
    room.players[socket.id] = {
      id: socket.id,
      color: color,
      ready: true
    };
    
    // Join the room
    socket.join(roomId);
    
    // Start the game
    room.gameStarted = true;
    
    // Notify both clients
    socket.emit('roomJoined', { roomId, color });
    io.to(roomId).emit('gameStarted');
    
    console.log(`Player joined room: ${roomId}, Player color: ${color}`);
  });

  // Handle player move
  socket.on('move', ({ roomId, board, turn, winner, redTotal, blackTotal, redMove, blackMove }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    
    // Update the board state and turn
    room.board = board;
    room.currentTurn = turn;
    
    // Update timers
    room.timers = {
      redTotal,
      blackTotal,
      redMove,
      blackMove
    };
    
    // Broadcast the updated board to all players in the room
    io.to(roomId).emit('updateBoard', { 
      board: room.board, 
      turn: room.currentTurn 
    });
    
    // Broadcast timer updates
    io.to(roomId).emit('updateTimers', room.timers);
    
    // Check for winner
    if (winner) {
      io.to(roomId).emit('gameOver', winner);
      room.gameStarted = false;
    }
  });

  // Handle chat messages
  socket.on('sendMessage', ({ roomId, message, color }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    const player = room.players[socket.id];
    
    if (!player) return;
    
    // Get sender label (Đỏ or Đen)
    const sender = color === 'red' ? 'Đỏ' : 'Đen';
    
    // Store message
    room.messages.push({
      sender,
      message,
      color
    });
    
    // Broadcast message to all players in the room
    io.to(roomId).emit('receiveMessage', {
      sender,
      message,
      color
    });
  });

  // Handle game over
  socket.on('gameOver', ({ roomId, winner }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    // Broadcast winner to all players
    io.to(roomId).emit('gameOver', winner);
    
    // Update room state
    const room = rooms.get(roomId);
    room.gameStarted = false;
  });

  // Handle game restart
  socket.on('restartGame', ({ roomId }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    
    // Reset game state
    room.board = JSON.parse(JSON.stringify(initialBoardState));
    room.currentTurn = 'red';
    room.gameStarted = true;
    room.timers = {
      redTotal: 600,
      blackTotal: 600,
      redMove: 120,
      blackMove: 120
    };
    
    // Broadcast restart to all players
    io.to(roomId).emit('restartGame');
    
    // Broadcast timer updates to all players
    io.to(roomId).emit('updateTimers', room.timers);
  });

  // Handle game start notification
  socket.on('gameStarted', ({ roomId }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    room.gameStarted = true;
    
    // Broadcast to all players
    io.to(roomId).emit('gameStarted');
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find and handle rooms where this player was
    for (const [roomId, room] of rooms.entries()) {
      if (room.players[socket.id]) {
        // Remove player from the room
        delete room.players[socket.id];
        
        // If room is empty, delete it
        if (Object.keys(room.players).length === 0) {
          rooms.delete(roomId);
          console.log(`Room deleted: ${roomId}`);
        } else {
          // Notify remaining player
          io.to(roomId).emit('playerDisconnected', {
            message: 'Đối thủ đã ngắt kết nối'
          });
          
          // Game is paused when a player disconnects
          room.gameStarted = false;
        }
      }
    }
  });
});

// Simple health check endpoint
app.get('/', (req, res) => {
  res.send('Xiangqi Server is running!');
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});