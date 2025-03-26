const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');


// Initialize express app and server
const app = express();
app.use(cors());
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',  // Allows connection from local development environment
      'http://150.95.113.55',   // Allows connection from your cloud server's HTTP domain
      'https://150.95.113.55'   // Allows connection from your cloud server's HTTPS domain
    ],
    methods: ['GET', 'POST']
  }
});

const waitingPlayers = {
  red: null,
  black: null,
  any: []  // Người chơi không chọn màu cụ thể
};

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

  
  // Thêm sự kiện hủy tìm trận
  socket.on('cancelFindMatch', () => {
    // Xóa người chơi khỏi tất cả các danh sách chờ
    if (waitingPlayers.red === socket.id) {
      waitingPlayers.red = null;
    }
    
    if (waitingPlayers.black === socket.id) {
      waitingPlayers.black = null;
    }
    
    const anyIndex = waitingPlayers.any.indexOf(socket.id);
    if (anyIndex !== -1) {
      waitingPlayers.any.splice(anyIndex, 1);
    }
    
    socket.emit('matchCancelled');
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