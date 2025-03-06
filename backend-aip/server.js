const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

let rooms = {}; // Danh sách các phòng

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Tạo phòng
  socket.on("createRoom", ({ color }) => {
    const roomId = `room-${socket.id}`;
    rooms[roomId] = {
      players: { [socket.id]: color },
      turn: "red",
      board: [
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
      ],
    };

    socket.join(roomId);
    socket.emit("roomCreated", { roomId, color });
  });

  // Tham gia phòng
  socket.on("joinRoom", ({ roomId }) => {
    if (rooms[roomId] && Object.keys(rooms[roomId].players).length === 1) {
      const opponentColor =
        Object.values(rooms[roomId].players)[0] === "red" ? "black" : "red";
      rooms[roomId].players[socket.id] = opponentColor;
      socket.join(roomId);
      socket.emit("roomJoined", { roomId, color: opponentColor });

      // Gửi dữ liệu bàn cờ cho cả hai người chơi
      io.to(roomId).emit("updateBoard", {
        board: rooms[roomId].board,
        turn: rooms[roomId].turn,
      });
      
    } else {
      socket.emit("roomJoinError", "Phòng không tồn tại hoặc đã đủ người.");
    }
  });

  socket.on("move", ({ roomId, board, turn, winner }) => {
    if (rooms[roomId]) {
      rooms[roomId].board = board;
      rooms[roomId].turn = turn;
  
      // Cập nhật bàn cờ cho cả hai bên
      io.to(roomId).emit("updateBoard", { board, turn });
  
      // Nếu có người thắng, gửi sự kiện gameOver tới cả phòng
      if (winner) {
        io.to(roomId).emit("gameOver", winner);
      }
    }
  });
  
  // Xử lý restart game
  socket.on("restartGame", ({ roomId, initialBoardState }) => {
    if (rooms[roomId]) {
      rooms[roomId].board = initialBoardState;
      rooms[roomId].turn = "red"; // Reset lượt chơi
  
      io.to(roomId).emit("updateBoard", {
        board: initialBoardState,
        turn: "red",
      });
  
      io.to(roomId).emit("restartGame"); // Gửi thông báo reset cho cả phòng
    }
  });
  
  
  
  // Ngắt kết nối
  socket.on("disconnect", () => {
    Object.keys(rooms).forEach((roomId) => {
      if (rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];

        // Nếu không còn ai trong phòng, xoá phòng
        if (Object.keys(rooms[roomId].players).length === 0) {
          delete rooms[roomId];
        }
      }
    });
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
