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

  socket.on('restartGame', () => {
    setBoard(initialBoardState);
    setWinner(null);
    setSelected(null);
    setValidMoves([]);
    setRedTotalTime(600);
    setBlackTotalTime(600);
    setRedMoveTime(120);
    setBlackMoveTime(120);
    setCurrentTurn("red");
    setGameStarted(true);
    setHighlightedTargets([]);
    
    // Quan trọng: Xóa bộ đếm hiện tại để đảm bảo useEffect sẽ tạo bộ đếm mới
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  });

  // Handle game start notification
  socket.on('gameStarted', ({ roomId }) => {
    // Check if room exists
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    room.gameStarted = true;
    
    // Broadcast to all players
    io.to(roomId).emit('gameStarted');
    io.to(roomId).emit('startTimers'); // Thêm sự kiện mới để báo client bắt đầu đếm thời gian
  });

  // Add to the socket.io event handlers
  socket.on('readyToRestart', ({ roomId }) => {
    // Kiểm tra nếu phòng tồn tại
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    
    // Đánh dấu người chơi này là sẵn sàng
    if (room.players[socket.id]) {
      // Khởi tạo thuộc tính readyToRestart nếu nó không tồn tại
      if (!room.readyToRestart) {
        room.readyToRestart = {};
      }
      
      room.readyToRestart[socket.id] = true;
      
      // Thông báo cho tất cả người chơi về việc người chơi này đã sẵn sàng
      io.to(roomId).emit('playerReadyToRestart', { 
        playerId: socket.id 
      });
      
      // Kiểm tra nếu tất cả người chơi đã sẵn sàng
      const allPlayers = Object.keys(room.players);
      const readyPlayers = Object.keys(room.readyToRestart || {});
      
      if (allPlayers.length === 2 && allPlayers.every(id => readyPlayers.includes(id))) {
        // Cả hai người chơi đều sẵn sàng, bắt đầu lại trò chơi
        room.board = JSON.parse(JSON.stringify(initialBoardState));
        room.currentTurn = 'red';
        room.gameStarted = true;
        room.timers = {
          redTotal: 600,
          blackTotal: 600,
          redMove: 120,
          blackMove: 120
        };
        // Xóa các cờ sẵn sàng
        room.readyToRestart = {};
        
        // Thông báo cho tất cả người chơi rằng cả hai đều sẵn sàng và trò chơi đang khởi động lại
        io.to(roomId).emit('bothPlayersReady');
        io.to(roomId).emit('restartGame');
        io.to(roomId).emit('updateTimers', room.timers);
        io.to(roomId).emit('startTimers'); // Thêm sự kiện mới để báo client bắt đầu đếm thời gian
      } else {
        // Vẫn đang chờ người chơi kia
        socket.emit('waitingForOpponent');
      }
    }
  });

  // Modify the disconnect handler to handle readyToRestart state
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find and handle rooms where this player was
    for (const [roomId, room] of rooms.entries()) {
      if (room.players[socket.id]) {
        // Remove player from the room
        delete room.players[socket.id];
        
        // Remove from readyToRestart if exists
        if (room.readyToRestart && room.readyToRestart[socket.id]) {
          delete room.readyToRestart[socket.id];
        }
        
        // If room is empty, delete it
        if (Object.keys(room.players).length === 0) {
          rooms.delete(roomId);
          console.log(`Room deleted: ${roomId}`);
        } else {
          // Notify remaining player
          io.to(roomId).emit('playerDisconnected', {
            message: 'Đối thủ đã rời phòng'
          });
          
          // Game is paused when a player disconnects
          room.gameStarted = false;
        }
      }
    }
  });

  socket.on('findRandomMatch', ({ preferredColor }) => {
    console.log(`Player ${socket.id} looking for random match, preferred color: ${preferredColor}`);
    
    let match = null;
    
    // Logic ghép cặp người chơi
    if (preferredColor === 'any') {
      // Người chơi không có ưu tiên màu
      
      // Kiểm tra nếu có người đang chờ với màu cụ thể
      if (waitingPlayers.red) {
        match = {
          player: waitingPlayers.red,
          playerColor: 'red',
          opponentColor: 'black'
        };
        waitingPlayers.red = null;
      } else if (waitingPlayers.black) {
        match = {
          player: waitingPlayers.black,
          playerColor: 'black',
          opponentColor: 'red'
        };
        waitingPlayers.black = null;
      } else if (waitingPlayers.any.length > 0) {
        // Ghép với người chờ 'any' khác và chỉ định màu ngẫu nhiên
        const opponent = waitingPlayers.any.shift();
        const randomColor = Math.random() < 0.5 ? 'red' : 'black';
        
        match = {
          player: opponent,
          playerColor: randomColor === 'red' ? 'black' : 'red',
          opponentColor: randomColor
        };
      } else {
        // Không có ai đang chờ, thêm người chơi này vào hàng đợi
        waitingPlayers.any.push(socket.id);
        socket.emit('waitingForMatch');
        return;
      }
    } else {
      // Người chơi có ưu tiên màu cụ thể (red hoặc black)
      const oppositeColor = preferredColor === 'red' ? 'black' : 'red';
      
      // Kiểm tra nếu có người đang chờ với màu ngược lại
      if (waitingPlayers[oppositeColor]) {
        match = {
          player: waitingPlayers[oppositeColor],
          playerColor: oppositeColor,
          opponentColor: preferredColor
        };
        waitingPlayers[oppositeColor] = null;
      } else if (waitingPlayers.any.length > 0) {
        // Ghép với người chờ 'any'
        const opponent = waitingPlayers.any.shift();
        
        match = {
          player: opponent,
          playerColor: oppositeColor,
          opponentColor: preferredColor
        };
      } else {
        // Không có ai đang chờ với màu phù hợp, thêm người chơi này vào hàng đợi
        waitingPlayers[preferredColor] = socket.id;
        socket.emit('waitingForMatch');
        return;
      }
    }
    
    // Nếu tìm thấy đối thủ, tạo phòng và ghép nối họ
    if (match) {
      const roomId = uuidv4().substring(0, 8);
      
      // Khởi tạo phòng mới
      rooms.set(roomId, {
        players: {
          [socket.id]: {
            id: socket.id,
            color: match.opponentColor,
            ready: true
          },
          [match.player]: {
            id: match.player,
            color: match.playerColor,
            ready: true
          }
        },
        board: JSON.parse(JSON.stringify(initialBoardState)),
        currentTurn: 'red',
        gameStarted: true,
        messages: [],
        timers: {
          redTotal: 600,
          blackTotal: 600,
          redMove: 120,
          blackMove: 120
        }
      });
      
      // Thêm cả hai người chơi vào phòng
      socket.join(roomId);
      io.sockets.sockets.get(match.player)?.join(roomId);
      
      // Thông báo cho cả hai người chơi
      socket.emit('matchFound', { roomId, color: match.opponentColor });
      io.to(match.player).emit('matchFound', { roomId, color: match.playerColor });
      
      // Bắt đầu trò chơi
      io.to(roomId).emit('gameStarted');
      io.to(roomId).emit('startTimers');
      
      console.log(`Random match created: ${roomId}, Players: ${socket.id}(${match.opponentColor}) and ${match.player}(${match.playerColor})`);
    }
  });
  
  // Cập nhật hàm disconnect để xóa người chơi khỏi hàng đợi ghép cặp ngẫu nhiên
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Xóa người chơi khỏi hàng đợi ghép cặp
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
    
    // Xử lý phòng (code hiện tại ở đây)
    // ...
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