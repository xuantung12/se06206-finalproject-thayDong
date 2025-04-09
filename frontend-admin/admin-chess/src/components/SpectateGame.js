import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { FaArrowLeft, FaCommentDots, FaUsers } from "react-icons/fa";

const socket = io("http://150.95.111.7:4000");

const SpectateGame = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [redTotalTime, setRedTotalTime] = useState(600);
  const [blackTotalTime, setBlackTotalTime] = useState(600);
  const [redMoveTime, setRedMoveTime] = useState(120);
  const [blackMoveTime, setBlackMoveTime] = useState(120);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [winner, setWinner] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Piece images (same as in ChessOnline)
  const pieceImages = {
    "車": process.env.PUBLIC_URL + "/images/bR.svg",
    "马": process.env.PUBLIC_URL + "/images/rH.svg",
    "象": process.env.PUBLIC_URL + "/images/bE.svg",
    "士": process.env.PUBLIC_URL + "/images/bA.svg",
    "將": process.env.PUBLIC_URL + "/images/bG.svg",
    "砲": process.env.PUBLIC_URL + "/images/bC.svg",
    "兵": process.env.PUBLIC_URL + "/images/bS.svg",
    "车": process.env.PUBLIC_URL + "/images/rR.svg",
    "馬": process.env.PUBLIC_URL + "/images/bH.svg",
    "相": process.env.PUBLIC_URL + "/images/rE.svg",
    "仕": process.env.PUBLIC_URL + "/images/rA.svg",
    "帅": process.env.PUBLIC_URL + "/images/rG.svg",
    "炮": process.env.PUBLIC_URL + "/images/rC.svg",
    "卒": process.env.PUBLIC_URL + "/images/rS.svg"
  };

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Join as spectator when component mounts
    socket.emit("joinAsSpectator", { roomId });

    // Listen for game state updates
    socket.on("gameState", ({ board, currentTurn, timers, messages }) => {
      setBoard(board);
      setCurrentTurn(currentTurn);
      if (timers) {
        setRedTotalTime(timers.redTotal);
        setBlackTotalTime(timers.blackTotal);
        setRedMoveTime(timers.redMove);
        setBlackMoveTime(timers.blackMove);
      }
      if (messages) {
        setMessages(messages);
      }
    });

    // Listen for board updates
    socket.on("updateBoard", ({ board, turn }) => {
      setBoard(board);
      setCurrentTurn(turn);
    });

    // Listen for timer updates
    socket.on("updateTimers", ({ redTotal, blackTotal, redMove, blackMove }) => {
      setRedTotalTime(redTotal);
      setBlackTotalTime(blackTotal);
      setRedMoveTime(redMove);
      setBlackMoveTime(blackMove);
    });

    // Listen for chat messages
    socket.on("receiveMessage", ({ sender, message, color }) => {
      setMessages(prevMessages => [...prevMessages, { sender, message, color }]);
    });

    // Listen for spectator count updates
    socket.on("spectatorJoined", ({ spectatorCount }) => {
      setSpectatorCount(spectatorCount);
    });

    socket.on("spectatorLeft", ({ spectatorCount }) => {
      setSpectatorCount(spectatorCount);
    });

    // Listen for game over
    socket.on("gameOver", (winnerMessage) => {
      setWinner(winnerMessage);
    });

    socket.on("error", ({ message }) => {
      alert(message);
      navigate("/active-games");
    });

    return () => {
      socket.off("gameState");
      socket.off("updateBoard");
      socket.off("updateTimers");
      socket.off("receiveMessage");
      socket.off("spectatorJoined");
      socket.off("spectatorLeft");
      socket.off("gameOver");
      socket.off("error");
    };
  }, [roomId, navigate]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send chat message as spectator
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    
    socket.emit("sendMessage", { 
      roomId, 
      message: newMessage,
      color: "spectator" 
    });
    
    setNewMessage("");
  };

  // Render a chess piece
  const renderPiece = (piece, row, col) => {
    if (!piece) return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {pieceImages[piece] ? (
          <img src={pieceImages[piece]} alt={piece} className="w-10 h-10" />
        ) : (
          <span className="text-2xl">{piece}</span>
        )}
      </div>
    );
  };

  // Render the board
  const renderBoard = () => {
    if (!board) return null;
    
    return (
      <div className="grid grid-cols-9 w-[483px] h-[547px] border-2 border-gray-700 relative rounded-lg">
        {board.map((row, rowIndex) => (
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="relative border border-gray-700"
              style={{
                width: `${483 / 9}px`,
                height: `${547 / 10}px`,
              }}
            >
              {renderPiece(piece, rowIndex, colIndex)}
            </div>
          ))
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/active-games")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" />
          Quay lại danh sách trận đấu
        </button>
        
        <h1 className="text-2xl font-bold ml-4 flex-grow text-center">
          Xem trận đấu - Phòng {roomId}
        </h1>
        
        <div className="flex items-center text-gray-600">
          <FaUsers className="mr-1" />
          <span>{spectatorCount} người xem</span>
        </div>
      </div>

      {winner && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
          <h2 className="text-xl font-bold">{winner}</h2>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <div
            className="relative w-[483px] h-[547px] border-2 border-gray-700 rounded-lg mx-auto"
            style={{
              backgroundImage: "url('/images/board.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {renderBoard()}
          </div>

          <div className="flex flex-row pt-3 px-4 py-2 bg-gray-200 border border-gray-400 rounded-md mt-3">
            <div>
              <p>
                Bạn đang xem với tư cách khán giả
              </p>
            </div>
            <div className="ml-auto">
              <p>
                Lượt chơi hiện tại:{" "}
                <span className={`font-bold ${currentTurn === "red" ? "text-red-600" : "text-gray-800"}`}>
                  {currentTurn === "red" ? "Đỏ" : "Đen"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="flex flex-col h-full">
            {/* Timers */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Thời gian</h3>
              
              {/* Black Timer */}
              <div className="w-full bg-gray-50 mb-2 p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-800">Quân Đen</h4>
                  <div className="flex gap-4">
                    <div>
                      {/* <div className="text-sm text-gray-500">Tổng thời gian:</div>
                      <div className="text-xl font-mono">{formatTime(blackTotalTime)}</div> */}
                    </div>
                    <div>
                      {/* <div className="text-sm text-gray-500">Thời gian/nước:</div>
                      <div className={`text-xl font-mono ${blackMoveTime < 30 ? "text-red-500" : ""}`}>
                        {formatTime(blackMoveTime)}
                      </div> */}
                    </div>
                    {currentTurn === "black" && (
                      <div className="text-green-600 font-medium self-center animate-pulse">
                        Đang đi...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Red Timer */}
              <div className="w-full bg-gray-50 p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-red-600">Quân Đỏ</h4>
                  <div className="flex gap-4">
                    <div>
                      {/* <div className="text-sm text-gray-500">Tổng thời gian:</div>
                      <div className="text-xl font-mono">{formatTime(redTotalTime)}</div> */}
                    </div>
                    <div>
                      {/* <div className="text-sm text-gray-500">Thời gian/nước:</div>
                      <div className={`text-xl font-mono ${redMoveTime < 30 ? "text-red-500" : ""}`}>
                        {formatTime(redMoveTime)}
                      </div> */}
                    </div>
                    {currentTurn === "red" && (
                      <div className="text-green-600 font-medium self-center animate-pulse">
                        Đang đi...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="flex-grow border rounded-lg shadow-sm">
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <h3 className="text-lg font-semibold">
                  <FaCommentDots className="inline mr-2" />
                  Trò chuyện
                </h3>
                <button 
                  onClick={() => setShowChat(!showChat)} 
                  className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  {showChat ? "Ẩn" : "Hiện"}
                </button>
              </div>
              
              {showChat && (
                <>
                  <div className="h-[300px] overflow-y-auto p-3 bg-gray-50">
                    {messages.map((msg, index) => (
                      <div key={index} className="mb-2">
                        <span className={`font-semibold ${
                          msg.color === "red" ? "text-red-600" : 
                          msg.color === "black" ? "text-gray-800" : 
                          "text-blue-600"
                        }`}>
                          {msg.color === "spectator" ? "Khán giả" : msg.sender}:
                        </span>
                        <span className="ml-2">{msg.message}</span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={sendMessage} className="flex border-t">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-3 py-2 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700"
                    >
                      Gửi
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectateGame;