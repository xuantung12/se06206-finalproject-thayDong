import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import EarthGlobeSpinner from "./chess-earth";
import { FaGamepad, FaPuzzlePiece, FaBook, FaCommentDots, FaSun, FaMoon, FaGlobe, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";

const socket = io("http://150.95.111.7:4000", {
  withCredentials: false,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});

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

const pieceImages = {
  "車": "/images/bR.svg",
  "马": "/images/rH.svg",
  "象": "/images/bE.svg",
  "士": "/images/bA.svg",
  "將": "/images/bG.svg",
  "砲": "/images/bC.svg",
  "兵": "/images/bS.svg",
  "车": "/images/rR.svg",
  "馬": "/images/bH.svg",
  "相": "/images/rE.svg",
  "仕": "/images/rA.svg",
  "帅": "/images/rG.svg",
  "炮": "/images/rC.svg",
  "卒": "/images/rS.svg"
};

const ChessOnline = () => {

  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);


  const [board, setBoard] = useState(initialBoardState);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const [checkMessage, setCheckMessage] = useState(null);
  const [highlightedTargets, setHighlightedTargets] = useState([]);
  
  const [roomId, setRoomId] = useState("");
  const [playerColor, setPlayerColor] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("red");
  const [isInRoom, setIsInRoom] = useState(false);
  const [inputRoomId, setInputRoomId] = useState("");

  // Timer state
  const [redTotalTime, setRedTotalTime] = useState(600); // 10 minutes in seconds
  const [blackTotalTime, setBlackTotalTime] = useState(600);
  const [redMoveTime, setRedMoveTime] = useState(120); // 2 minutes in seconds
  const [blackMoveTime, setBlackMoveTime] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Timer refs to access current state in interval
  const redTotalTimeRef = useRef(redTotalTime);
  const blackTotalTimeRef = useRef(blackTotalTime);
  const redMoveTimeRef = useRef(redMoveTime);
  const blackMoveTimeRef = useRef(blackMoveTime);
  const currentTurnRef = useRef(currentTurn);
  const winnerRef = useRef(winner);
  const gameStartedRef = useRef(gameStarted);
  const timerIntervalRef = useRef(null);

  // chat 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef(null);

  // Add to the state variables near the top:
  const [readyToRestart, setReadyToRestart] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState(null);

  //match random 
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);

  // Update refs when state changes
  useEffect(() => {
    redTotalTimeRef.current = redTotalTime;
    blackTotalTimeRef.current = blackTotalTime;
    redMoveTimeRef.current = redMoveTime;
    blackMoveTimeRef.current = blackMoveTime;
    currentTurnRef.current = currentTurn;
    winnerRef.current = winner;
    gameStartedRef.current = gameStarted;
  }, [redTotalTime, blackTotalTime, redMoveTime, blackMoveTime, currentTurn, winner, gameStarted]);

  const isBlackPiece = (piece) => ["將", "士", "象", "馬", "車", "砲", "兵"].includes(piece);
  const isRedPiece = (piece) => ["帅", "仕", "相", "马", "车", "炮", "卒"].includes(piece);

  // Xác định màu quân cờ: Đỏ hoặc Đen
  const getPieceColor = (piece) => {
    if (!piece) return null;
    return "車馬象士將砲兵".includes(piece) ? "black" : "red";
  };

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Thay thế useEffect xử lý timer hiện tại bằng phiên bản này:
useEffect(() => {
  // Chỉ bắt đầu bộ đếm khi cả hai người chơi đã tham gia và trò chơi đã bắt đầu
  if (isInRoom && gameStarted && !winnerRef.current) {
    // Xóa bất kỳ bộ đếm hiện có nào trước khi thiết lập bộ đếm mới
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    timerIntervalRef.current = setInterval(() => {
      if (currentTurnRef.current === "red") {
        // Giảm thời gian của người chơi đỏ
        const newRedTotalTime = redTotalTimeRef.current - 1;
        const newRedMoveTime = redMoveTimeRef.current - 1;
        
        setRedTotalTime(newRedTotalTime);
        setRedMoveTime(newRedMoveTime);
        
        // Kiểm tra nếu hết thời gian
        if (newRedTotalTime <= 0 || newRedMoveTime <= 0) {
          clearInterval(timerIntervalRef.current);
          setWinner("Đen thắng! (Đỏ hết thời gian)");
          socket.emit("gameOver", { roomId, winner: "Đen thắng! (Đỏ hết thời gian)" });
        }
      } else {
        // Giảm thời gian của người chơi đen
        const newBlackTotalTime = blackTotalTimeRef.current - 1;
        const newBlackMoveTime = blackMoveTimeRef.current - 1;
        
        setBlackTotalTime(newBlackTotalTime);
        setBlackMoveTime(newBlackMoveTime);
        
        // Kiểm tra nếu hết thời gian
        if (newBlackTotalTime <= 0 || newBlackMoveTime <= 0) {
          clearInterval(timerIntervalRef.current);
          setWinner("Đỏ thắng! (Đen hết thời gian)");
          socket.emit("gameOver", { roomId, winner: "Đỏ thắng! (Đen hết thời gian)" });
        }
      }
    }, 1000);
  }

  return () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };
}, [isInRoom, gameStarted, roomId, winner]); // Thêm winner vào dependencies

useEffect(() => {
  // Gọi API lấy user từ session
  axios.get("http://150.95.111.7:3001/session-user", { withCredentials: true })
    .then(response => {
      setUser(response.data.user);
    })
    .catch(() => {
      setUser(null); // Không có session -> user chưa đăng nhập
    });


  // Lấy trạng thái dark mode từ localStorage
  setDarkMode(localStorage.getItem("darkMode") === "true");
}, []);

const handleLogout = () => {
  axios.post("http://150.95.111.7:3001/logout", {}, { withCredentials: true })
    .then(() => {
      setUser(null);
    })
    .catch(error => {
      console.error("Lỗi đăng xuất:", error);
    });
};


const toggleDarkMode = () => {
  const newMode = !darkMode;
  setDarkMode(newMode);
  localStorage.setItem("darkMode", newMode);
};

  // Add this new useEffect for scrolling to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add this function to handle sending messages
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    
    socket.emit("sendMessage", { 
      roomId, 
      message: newMessage,
      color: playerColor 
    });
    
    setNewMessage("");
  };

  useEffect(() => {
    socket.on("roomCreated", ({ roomId, color }) => {
      setRoomId(roomId);
      setPlayerColor(color);
      setIsInRoom(true);
    });

    socket.on("roomJoined", ({ roomId, color }) => {
      setRoomId(roomId);
      setPlayerColor(color);
      setIsInRoom(true);
      // Start the game when second player joins
      setGameStarted(true);
      socket.emit("gameStarted", { roomId });
    });

    socket.on("gameStarted", () => {
      setGameStarted(true);
    });
    

    //match random
    socket.on('waitingForMatch', () => {
      setIsSearchingMatch(true);
    });
    
    socket.on('matchFound', ({ roomId, color }) => {
      setRoomId(roomId);
      setPlayerColor(color);
      setIsInRoom(true);
      setGameStarted(true);
      setIsSearchingMatch(false);
    });
    
    socket.on('matchCancelled', () => {
      setIsSearchingMatch(false);
    });


    socket.on("updateBoard", ({ board, turn }) => {
      setBoard(board);
      setCurrentTurn(turn);
      
      // Reset move timer for the player whose turn it is now
      if (turn === "red") {
        setRedMoveTime(120);
      } else {
        setBlackMoveTime(120);
      }
    });

    socket.on("updateTimers", ({ redTotal, blackTotal, redMove, blackMove }) => {
      setRedTotalTime(redTotal);
      setBlackTotalTime(blackTotal);
      setRedMoveTime(redMove);
      setBlackMoveTime(blackMove);
    });

    // Add this new handler for chat messages
    socket.on("receiveMessage", ({ sender, message, color }) => {
      setMessages(prevMessages => [...prevMessages, { sender, message, color }]);
    });

    socket.on("gameOver", (winnerMessage) => {
      setWinner(winnerMessage);
      clearInterval(timerIntervalRef.current);
    });


    // Add to the useEffect with socket listeners:
    socket.on('playerReadyToRestart', ({ playerId }) => {
      // If the ready signal isn't from the current player, it's from the opponent
      if (playerId !== socket.id) {
        setOpponentReady(true);
      }
    });


    socket.on('waitingForOpponent', () => {
      setWaitingMessage("Đang chờ đối thủ sẵn sàng...");
    });

    socket.on('bothPlayersReady', () => {
      setReadyToRestart(false);
      setOpponentReady(false);
      setWaitingMessage(null);
      // Game will be restarted via the existing 'restartGame' event
    });

    socket.on('playerDisconnected', ({ message }) => {
      setWaitingMessage(message);
      setOpponentReady(false);
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
      // Quan trọng: Đặt lại bộ đếm thời gian
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    });

    
    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("gameStarted");
      socket.off("updateBoard");
      socket.off('waitingForMatch');//matchrandom
      socket.off('matchFound');
      socket.off('matchCancelled');
      socket.off("updateTimers");
      socket.off("receiveMessage");
      socket.off("gameOver");
      socket.off("restartGame");
      socket.off("playerReadyToRestart");
      socket.off("waitingForOpponent");
      socket.off("bothPlayersReady");
      socket.off("playerDisconnected");
    };
  }, []);

  const createRoom = (color) => {
    socket.emit("createRoom", { color });
  };

  const joinRoom = () => {
    socket.emit("joinRoom", { roomId: inputRoomId });
  };

  // Component cho menu item trong sidebar
    function MenuItem({ icon, text, isExpanded, link, onClick }) {
      return (
        <a href={link} onClick={onClick} className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
          <span className="text-xl">{icon}</span>
          {isExpanded && <span>{text}</span>}
        </a>
      );
    }


  
  // Kiểm tra nếu tướng đang bị chiếu ngay sau nước đi
  const isKingInCheck = (newBoard) => {
    let redKing = null, blackKing = null;

    // Tìm vị trí của tướng đỏ (帅) và tướng đen (將)
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c] === "帅") redKing = [r, c];
        if (newBoard[r][c] === "將") blackKing = [r, c];
      }
    }

    // Kiểm tra xem có quân nào có thể ăn tướng hay không
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = newBoard[r][c];
        if (piece) {
          const moves = findValidMoves(r, c, newBoard);
          for (let [mr, mc] of moves) {
            if ((redKing && mr === redKing[0] && mc === redKing[1]) ||
                (blackKing && mr === blackKing[0] && mc === blackKing[1])) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  //hàm sử lí match 
  const findRandomMatch = (preferredColor) => {
    socket.emit('findRandomMatch', { preferredColor });
  };
  
  const cancelFindMatch = () => {
    socket.emit('cancelFindMatch');
    setIsSearchingMatch(false);
  };

  // Hàm chuyển đổi tọa độ từ tọa độ người dùng sang tọa độ thực tế của bàn cờ
  const convertToRealCoords = (row, col) => {
    if (playerColor === "black") {
      // Đối với người chơi quân đen, lật ngược tọa độ
      return [9 - row, 8 - col];
    }
    // Đối với người chơi quân đỏ, giữ nguyên tọa độ
    return [row, col];
  };

  // Hàm chuyển đổi từ tọa độ thực tế sang tọa độ hiển thị cho người dùng
  const convertToDisplayCoords = (row, col) => {
    if (playerColor === "black") {
      // Đối với người chơi quân đen, lật ngược tọa độ
      return [9 - row, 8 - col];
    }
    // Đối với người chơi quân đỏ, giữ nguyên tọa độ
    return [row, col];
  };

  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    if (!isInRoom || playerColor !== currentTurn || winner) return;
    
    // Chuyển đổi tọa độ hiển thị thành tọa độ thực tế
    const [realFromRow, realFromCol] = convertToRealCoords(fromRow, fromCol);
    const [realToRow, realToCol] = convertToRealCoords(toRow, toCol);
    
    const newBoard = [...board.map(row => [...row])];
    newBoard[realToRow][realToCol] = newBoard[realFromRow][realFromCol];
    newBoard[realFromRow][realFromCol] = null;

    const nextTurn = currentTurn === "red" ? "black" : "red";

    // Send updated board and turn info
    socket.emit("move", { 
      roomId, 
      board: newBoard, 
      turn: nextTurn,
      redTotal: redTotalTime,
      blackTotal: blackTotalTime,
      redMove: currentTurn === "red" ? 120 : redMoveTime, // Reset move timer for red if it was red's turn
      blackMove: currentTurn === "black" ? 120 : blackMoveTime // Reset move timer for black if it was black's turn
    });

    setBoard(newBoard);
    setCurrentTurn(nextTurn);
    
    // Reset the move timer for the player who just moved
    if (currentTurn === "red") {
      setRedMoveTime(120);
    } else {
      setBlackMoveTime(120);
    }
  };
  
  const isMoveValid = (piece, fromRow, fromCol, toRow, toCol, boardState = board) => {
    // Chuyển đổi tọa độ hiển thị thành tọa độ thực tế
    const [realFromRow, realFromCol] = convertToRealCoords(fromRow, fromCol);
    const [realToRow, realToCol] = convertToRealCoords(toRow, toCol);
    
    const targetPiece = boardState[realToRow][realToCol];
    const pieceColor = getPieceColor(piece);
    const targetPieceColor = getPieceColor(targetPiece);

    // Nếu ô đích có quân cùng màu -> Không hợp lệ
    if (targetPiece && pieceColor === targetPieceColor) return false;

    const rowDiff = Math.abs(realToRow - realFromRow);
    const colDiff = Math.abs(realToCol - realFromCol);

    switch (piece) {
      case "將":
      case "帅":
        return (
          realToCol >= 3 &&
          realToCol <= 5 &&
          ((realToRow >= 0 && realToRow <= 2) || (realToRow >= 7 && realToRow <= 9)) &&
          rowDiff + colDiff === 1
        );
      case "士":
      case "仕":
        return (
          realToCol >= 3 &&
          realToCol <= 5 &&
          ((realToRow >= 0 && realToRow <= 2) || (realToRow >= 7 && realToRow <= 9)) &&
          rowDiff === 1 &&
          colDiff === 1
        );
      case "象":
      case "相":
        return (
          rowDiff === 2 &&
          colDiff === 2 &&
          ((realFromRow < 5 && realToRow < 5) || (realFromRow >= 5 && realToRow >= 5)) &&
          boardState[(realFromRow + realToRow) / 2][(realFromCol + realToCol) / 2] === null
        );
      case "兵":
        return (
          (realToRow > realFromRow && rowDiff === 1 && colDiff === 0) ||
          (realFromRow >= 5 && rowDiff === 0 && colDiff === 1)
        );
      case "卒":
        return (
          (realToRow < realFromRow && rowDiff === 1 && colDiff === 0) ||
          (realFromRow <= 4 && rowDiff === 0 && colDiff === 1)
        );
      case "車":
      case "车":
        if (realFromRow === realToRow) {
          const minCol = Math.min(realFromCol, realToCol);
          const maxCol = Math.max(realFromCol, realToCol);
          for (let col = minCol + 1; col < maxCol; col++) {
            if (boardState[realFromRow][col]) return false;
          }
          return true;
        } else if (realFromCol === realToCol) {
          const minRow = Math.min(realFromRow, realToRow);
          const maxRow = Math.max(realFromRow, realToRow);
          for (let row = minRow + 1; row < maxRow; row++) {
            if (boardState[row][realFromCol]) return false;
          }
          return true;
        }
        return false;
      case "馬":
      case "马":
        return (
          (rowDiff === 2 && colDiff === 1 && !boardState[(realFromRow + realToRow) / 2][realFromCol]) ||
          (rowDiff === 1 && colDiff === 2 && !boardState[realFromRow][(realFromCol + realToCol) / 2])
        );
      case "砲":
      case "炮":
        let count = 0;
        if (realFromRow === realToRow) {
          const minCol = Math.min(realFromCol, realToCol);
          const maxCol = Math.max(realFromCol, realToCol);
          for (let col = minCol + 1; col < maxCol; col++) {
            if (boardState[realFromRow][col]) count++;
          }
        } else if (realFromCol === realToCol) {
          const minRow = Math.min(realFromRow, realToRow);
          const maxRow = Math.max(realFromRow, realToRow);
          for (let row = minRow + 1; row < maxRow; row++) {
            if (boardState[row][realFromCol]) count++;
          }
        } else {
          return false;
        }

        // Nếu ô đích không có quân -> Không được có vật cản
        if (!targetPiece) return count === 0;

        // Nếu ô đích có quân -> Phải có đúng 1 vật cản giữa đường
        return count === 1;
      default:
        return false;
    }
  };

  const findValidMoves = (row, col, boardState = board) => {
    // Chuyển đổi tọa độ hiển thị thành tọa độ thực tế
    const [realRow, realCol] = convertToRealCoords(row, col);
    
    const piece = boardState[realRow][realCol];
    let moves = [];

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        // Kiểm tra nước đi hợp lệ dựa trên tọa độ hiển thị
        if (isMoveValid(piece, row, col, convertToDisplayCoords(r, c)[0], convertToDisplayCoords(r, c)[1], boardState)) {
          // Lưu tọa độ hiển thị của các nước đi hợp lệ
          moves.push(convertToDisplayCoords(r, c));
        }
      }
    }
    return moves;
  };

  const handleCellClick = (row, col) => {
    if (winner) return; // Nếu đã có người thắng, không cho phép tiếp tục
    
    // Lấy tọa độ thực tế từ tọa độ hiển thị
    const [realRow, realCol] = convertToRealCoords(row, col);
    const currentPiece = board[realRow][realCol];

    // Kiểm tra nếu đang trong phòng và đến lượt người chơi
    if (isInRoom && playerColor !== currentTurn) return;

    if (selected) {
        const { row: selectedRow, col: selectedCol } = selected;
        
        // Không cho phép chọn lại quân cờ đã chọn
        if (selectedRow === row && selectedCol === col) {
            setSelected(null);
            setValidMoves([]);
            setHighlightedTargets([]); // Xóa highlight các quân bị đe dọa
            return;
        }

        // Lấy tọa độ thực tế của quân cờ đã chọn
        const [realSelectedRow, realSelectedCol] = convertToRealCoords(selectedRow, selectedCol);
        const piece = board[realSelectedRow][realSelectedCol];

        // Kiểm tra nếu nước đi hợp lệ
        if (isMoveValid(piece, selectedRow, selectedCol, row, col)) {
            const newBoard = board.map((r) => [...r]);
            
            // Lấy tọa độ thực tế cho việc di chuyển
            const [realFromRow, realFromCol] = convertToRealCoords(selectedRow, selectedCol);
            const [realToRow, realToCol] = convertToRealCoords(row, col);
            
            const targetPiece = newBoard[realToRow][realToCol];

            // Thực hiện di chuyển trên bàn cờ thực tế
            newBoard[realToRow][realToCol] = piece;
            newBoard[realFromRow][realFromCol] = null;

            // Kiểm tra nếu hai tướng đối diện nhau -> Không hợp lệ
            if (areKingsFacing(newBoard)) {
                // Show a message to the user that this move is not allowed
                setCheckMessage(
                    <span className="flex">
                        <img
                            src="/images/2swords.png"
                            alt="Lỗi Nước Đi"
                            style={{ width: "80px", height: "80px" }}
                        />
                        <p className="mt-5 ">Tướng không được đối diện!</p>
                    </span>
                );
                setTimeout(() => setCheckMessage(null), 1500);
                return; // Don't proceed with the move
            }

            // Gọi `handleMove` để xử lý nước đi với tọa độ hiển thị
            handleMove(selectedRow, selectedCol, row, col);

            // Kiểm tra chiếu tướng ngay lập tức
            if (isKingInCheck(newBoard)) {
                setCheckMessage(
                    <span className="flex">
                        <img
                            src="/images/2swords.png"
                            alt="Chiếu Tướng"
                            style={{ width: "80px", height: "80px" }}
                        />
                        <p className="mt-5">Chiếu tướng!</p>
                    </span>
                );
                setTimeout(() => setCheckMessage(null), 1000);
            }

            // Cập nhật lượt chơi
            const nextTurn = currentTurn === "red" ? "black" : "red";
            setCurrentTurn(nextTurn);

            let gameWinner = null;
            if (targetPiece === "將") gameWinner = "Đỏ thắng!";
            if (targetPiece === "帅") gameWinner = "Đen thắng!";

            // Cập nhật state cục bộ (cho người chơi này) và gửi dữ liệu lên server
            if (gameWinner) {
              setWinner(gameWinner);
              socket.emit("move", { 
                roomId, 
                board: newBoard, 
                turn: nextTurn, 
                winner: gameWinner,
                redTotal: redTotalTime,
                blackTotal: blackTotalTime,
                redMove: currentTurn === "red" ? 120 : redMoveTime,
                blackMove: currentTurn === "black" ? 120 : blackMoveTime
              });
            } else {
              socket.emit("move", { 
                roomId, 
                board: newBoard, 
                turn: nextTurn,
                redTotal: redTotalTime,
                blackTotal: blackTotalTime,
                redMove: currentTurn === "red" ? 120 : redMoveTime,
                blackMove: currentTurn === "black" ? 120 : blackMoveTime
              });
            }

            setBoard(newBoard);
            setSelected(null);
            setValidMoves([]);
            setHighlightedTargets([]); // Xóa highlight
        }
    } else if (currentPiece) {
        // Kiểm tra nếu quân cờ được chọn thuộc về người chơi hiện tại
        if ((playerColor === "red" && isBlackPiece(currentPiece)) || 
            (playerColor === "black" && isRedPiece(currentPiece))) {
            return;
        }

        setSelected({ row, col });
        const moves = findValidMoves(row, col);
        setValidMoves(moves);

        // Xác định các quân có thể bị ăn và highlight chúng
        const targets = moves.filter(([r, c]) => {
            const [realR, realC] = convertToRealCoords(r, c);
            return board[realR][realC] !== null;
        });
        setHighlightedTargets(targets);
    }
};

  const areKingsFacing = (board) => {
    let blackKingCol = null;
    let redKingCol = null;
    let blackKingRow = -1;
    let redKingRow = -1;
  
    // Find the positions of both kings
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === "將") {
          blackKingCol = c;
          blackKingRow = r;
        } else if (board[r][c] === "帅") {
          redKingCol = c;
          redKingRow = r;
        }
      }
    }
  
    // Make sure both kings were found
    if (blackKingCol === null || redKingCol === null) {
      return false;
    }
  
    // Check if kings are in the same column
    if (blackKingCol === redKingCol) {
      // Check if there are any pieces between the kings
      let hasObstacle = false;
      for (let r = Math.min(blackKingRow, redKingRow) + 1; r < Math.max(blackKingRow, redKingRow); r++) {
        if (board[r][blackKingCol]) {
          hasObstacle = true;
          break;
        }
      }
      
      // If there are no obstacles, the kings are facing each other (invalid position)
      return !hasObstacle;
    }
  
    // Kings are not in the same column, so they're not facing each other
    return false;
  };

  const renderBoard = () => {
    if (!board || !Array.isArray(board) || board.length === 0) {
      console.error("Board is undefined or not an array:", board);
      return null;
    }
  
    // Nếu là người chơi quân đen, lật bàn cờ
    const boardToRender = playerColor === "black"
      ? board.map((row, rowIndex) => row.map((_, colIndex) => 
          board[9 - rowIndex]?.[8 - colIndex] || null
        ))
      : board;
  
    return boardToRender.map((row, rowIndex) =>
      row.map((piece, colIndex) => {
        const isHighlighted = highlightedTargets.some(([r, c]) => r === rowIndex && c === colIndex);
        const isSelectedCell = selected?.row === rowIndex && selected?.col === colIndex;
        const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);
  
        return (
          <div
            key={`${rowIndex}-${colIndex}`}
            onClick={() => handleCellClick(rowIndex, colIndex)}
            className={`w-[50px] h-[51px] flex items-center justify-center cursor-pointer relative 
              ${isSelectedCell ? "bg-[rgb(143_0_0_/_83%)]" : ""}
              ${isHighlighted ? "shadow-[0_0_10px_4px_rgba(255,0,0,0.7)]" : ""}
            `}
          >
            {isValidMove && (
              <div className="absolute w-4 h-4 bg-[rgb(143_0_0_/_83%)] rounded-full hover:bg-yellow-500"></div>
            )}
            {piece && <img src={pieceImages[piece]} alt={piece} className="w-10 h-10" />}
          </div>
        );
      })
    );
  };
  

  return (
     <div className={`flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
           {/* Sidebar */}
           <aside
             className={`min-h-screen bg-orange-900 text-white flex flex-col items-center transition-all duration-300 ${
               isExpanded ? "w-64" : "w-16"
             }`}
             onMouseEnter={() => {
               setIsExpanded(true);
             }}
             onMouseLeave={() => {
               if (!keepOpen) {
                 setIsExpanded(false);
                 setPlayMenuOpen(false);
               }
             }}
           >
             {/* Logo */}
             <a href="/" className="flex items-center space-x-3 mt-5 mb-5">
               <img
                 src="/images/chess-piece.png"
                 alt="anh anh quan co do"
                 className="w-12 h-12"
               />
               {isExpanded && <span className="text-2xl font-bold">CoTuong.com</span>}
             </a>
     
     
             {/* Navigation */}
             <nav className="space-y-4 w-full">
               <div
                 className="relative"
                 onMouseEnter={() => {
                   setPlayMenuOpen(true);
                   setKeepOpen(true);
                 }}
                 onMouseLeave={() => {
                   setKeepOpen(false);
                   setTimeout(() => {
                     if (!keepOpen) {
                       setPlayMenuOpen(false);
                     }
                   }, 200);
                 }}
               >
               <MenuItem icon={<FaGamepad />} text={language === "en" ? "Play Now" : "Chơi Ngay"} isExpanded={isExpanded} link="/home-page" />
               </div>
               <MenuItem icon={<FaPuzzlePiece />} text={language === "en" ? "Puzzles" : "Câu đố"} isExpanded={isExpanded} link="/chess-puzzle" />
               <MenuItem icon={<FaBook />} text={language === "en" ? "Course" : "Khóa Học"} isExpanded={isExpanded} link="/chess-courses" />
               <MenuItem icon={<FaCommentDots />} text={language === "en" ? "Chat" : "Trò chuyện"} isExpanded={isExpanded} link="/chess-chat" />
             </nav>
     
     
             {/* Other Options */}
             <div className="mt-auto space-y-3 w-full mb-5">
               <button className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded" onClick={() => setLanguage(language === "en" ? "vi" : "en")}>
                 <FaGlobe />
                 {isExpanded && <span>{language === "en" ? "English" : "Tiếng Việt"}</span>}
               </button>
               <button className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded" onClick={toggleDarkMode}>
                 {darkMode ? <FaSun /> : <FaMoon />}
                 {isExpanded && <span>{darkMode ? (language === "en" ? "Light Mode" : "Chế độ sáng") : (language === "en" ? "Dark Mode" : "Chế độ tối")}</span>}
               </button>
     
     
               {/* Hiển thị avatar nếu đã đăng nhập */}
               {user ? (
                 <div className="relative w-full flex flex-col items-center">
                   <button className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
                     <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white" />
                     {isExpanded && <span>{user.username}</span>}
                   </button>
                   {/* Nút Sign Out ngay dưới avatar */}
                   <button
                     className="mt-2 w-full flex items-center justify-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                     onClick={handleLogout}
                   >
                     <FaSignOutAlt className="mr-2" /> {isExpanded ? (language === "en" ? "Sign Out" : "Đăng xuất") : ""}
                   </button>
                 </div>
               ) : (
                 <MenuItem icon={<FaSignInAlt />} text={language === "en" ? "Sign In" : "Đăng nhập"} isExpanded={isExpanded} link="/chess-login" />
               )}
             </div>
           </aside>
     
     
           {/* Sub-menu (Play) */}
           {playMenuOpen && (
             <div
               className={`absolute ${isExpanded ? "left-64" : "left-16"} top-0 bg-white text-gray-900 shadow-lg w-48 border border-gray-300 flex flex-col min-h-screen`}
               onMouseEnter={() => {
                 setKeepOpen(true);
               }}
               onMouseLeave={() => {
                 setKeepOpen(false);
                 setPlayMenuOpen(false);
                 setIsExpanded(false);
               }}
             >
               <a href="/chess-offline" className="block p-3 hover:bg-gray-200"><img src="images/play-computer-sm.svg" alt=""></img> {language === "en" ? "Play vs Computer" : "Chơi với máy"}</a>
                   <a href="/chess-online" className="block p-3 hover:bg-gray-200"><img src="images/challenge-friends.svg" alt=""></img>{language === "en" ? "Play Online" : "Chơi trực tuyến"}</a>
                   <a href="/option3" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 3" : "Tùy chỉnh 3"}</a>
                   <a href="/option4" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 4" : "Tùy chỉnh 4"}</a>
             </div>
           )}
    
    {/* ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}
          {/* Main Content */}
          
          <main className="flex-1 flex flex-col items-center p-2">
             <div className=" w-[100%] h-auto absolute bottom-0 left-0 size-16 pointer-events-none">
                <img src="images/96857e5411a903ed226e3c87e54cc29c (1).svg" alt="Ảnh mẫu"
                class="w-[100%] h-auto"></img>
              </div>
            <div>
            
              <div className="items-center ">
                <div className="flex flex-col items-center relative ">
                  <h1 className="text-2xl font-bold mb-6 mt-5">{language === "en" ? "XiangQI online" : "Cờ tướng trực tuyến"} </h1>
            
                  {/* Chỉ hiển thị khi chưa vào phòng */}
                  {!isInRoom ? (
                    <div className="flex flex-col p-9 items-center mb-6 border rounded-lg shadow-lg bg-[rgba(255,68,0,0.13)] ">
                      {/* ghép ngẫu nhiên */}
                      <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2">{language === "en" ? "Random pairing" : "Ghép ngẫu nhiên"}</h2>
                        {isSearchingMatch ? (
                          <div className="flex flex-col items-center gap-2 p-4  rounded-lg">
                            <EarthGlobeSpinner />
                            <span className="bg-gray-300 animate-pulse">{language === "en" ? "Looking for opponents..." : "Đang tìm đối thủ..."}</span>
                            <button
                              onClick={cancelFindMatch}
                              className="px-6 py-2 mt-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => findRandomMatch('red')}
                              className="px-10 py-3 bg-gray-300 text-black rounded-lg shadow-md hover:bg-red-700"
                            >
                              {language === "en" ? "Random Match (Red Army)" : "Ghép ngẫu nhiên (Quân Đỏ)"}
                            </button>
                            <button
                              onClick={() => findRandomMatch('black')}
                              className="px-10 py-3 bg-gray-300 text-black rounded-lg shadow-md hover:bg-gray-500"
                            >
                              {language === "en" ? "Random Match (Red Army)" : "Ghép ngẫu nhiên (Quân Đen)"}
                            </button>
                            <button
                              onClick={() => findRandomMatch('any')}
                              className="px-10 py-3 bg-gray-300 text-black rounded-lg shadow-md hover:bg-blue-700"
                            >
                              Ghép ngẫu nhiên (Bất kỳ)
                            </button>
                          </div>
                        )} 
                      </div>
                      {!isSearchingMatch &&(
                        <>
                          <h2 className="text-lg font-semibold mb-2 mt-3">Tạo hoặc tham gia phòng</h2>
                          <div className="mt-4 flex items-center gap-2 pb-4">
                            <input
                              type="text"
                              value={inputRoomId}
                              onChange={(e) => setInputRoomId(e.target.value)}
                              placeholder="Nhập ID phòng"
                              className="px-3 py-2 border rounded-lg"
                            />
                            <button
                              onClick={joinRoom}
                              className="px-4 py-2 bg-blue-600 text-black  rounded-lg shadow-md hover:bg-blue-700"
                            >
                              Tham gia phòng
                            </button>
                          </div>
                          <div className="flex flex-col gap-4">
                            <button
                              onClick={() => createRoom("red")}
                              className="px-16 py-3 bg-gray-300 text-black  rounded-lg shadow-md hover:bg-red-700"
                            >
                              Tạo phòng (Quân Đỏ)
                            </button>
                            <button
                              onClick={() => createRoom("black")}
                              className="px-16 py-3 mb-7 bg-gray-300 text-black  rounded-lg shadow-md hover:bg-gray-500"
                            >
                              Tạo phòng (Quân Đen)
                            </button>
                          </div>
                        </>
                      )}
                      
                    </div>
                  ) : (
                    <>
                      {/* Hiển thị thông tin phòng */}
                      <div className="mb-4 text-center">
                        <p className="font-semibold">
                          Phòng ID: <span className="text-blue-600">{roomId}</span>
                        </p>
                        {/* <p>
                          Bạn đang chơi quân{" "}
                          <span className={`font-bold ${playerColor === "red" ? "text-red-600" : "text-gray-800"}`}>
                            {playerColor === "red" ? "Đỏ" : "Đen"}
                          </span>
                        </p>
                        <p>
                          Lượt chơi hiện tại:{" "}
                          <span className={`font-bold ${currentTurn === "red" ? "text-red-600" : "text-gray-800"}`}>
                            {currentTurn === "red" ? "Đỏ" : "Đen"}
                          </span>
                        </p> */}
                      </div>
            
                      {/* Chỉ hiển thị bàn cờ và bảng thời gian khi đã vào phòng */}
                      <div className="flex flex-row items-center justify-between w-full max-w-[62rem] px-4">
                        {/* Hiển thị thông báo người thắng */}
                        {winner && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded-lg shadow-2xl border-4 border-yellow-500 text-center">
                          <h2 className="text-3xl font-bold mb-4">{winner}</h2>
                          <button
                            onClick={() => {
                              setReadyToRestart(true);
                              socket.emit("readyToRestart", { roomId });
                              
                            }}
                            className={`px-6 py-2 ${readyToRestart ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-lg shadow-md hover:${readyToRestart ? 'bg-green-700' : 'bg-blue-700'} mb-2`}
                            disabled={readyToRestart}
                          >
                            {readyToRestart ? "Đã sẵn sàng" : "Chơi lại"}
                          </button>
                          
                          {waitingMessage && (
                            <div className="mt-2 text-orange-600 font-medium">
                              <div className="text-green-600 font-semibold mb-2">Bạn đã sẵn sàng!</div>
                              {waitingMessage}
                            </div>
                          )}
                          
                          {opponentReady && !readyToRestart && (
                            
                            <div className="mt-2 text-green-600 font-medium">
                              Đối thủ đã sẵn sàng chơi lại!
                            </div>
                          )}
                        </div>
                      )}

                        {/* Hiển thị thông báo chiếu tướng */}
                        {/* {checkMessage && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-red-100 p-6 rounded-lg shadow-xl border-2 border-red-500 text-center animate-pulse">
                            {checkMessage}
                          </div>
                        )} */}

                        

                          {/* Vùng chứa bàn cờ với hình nền */}
                            <div
                              className="relative w-[483px] h-[547px] border-2 border-gray-700 rounded-lg"
                              style={{
                                backgroundImage: "url('/images/board.png')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            >
                          {/* Bàn cờ */}
                          <div className="flex flex-col ">
                            <div className="grid grid-cols-9 w-[483px] h-[547px] border-2 border-gray-700 relative rounded-lg">
                              {renderBoard()}

                              {/* Hiển thị thông báo Kiểm tra (Check) */}
                              {checkMessage && (
                                <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 text-black text-3xl font-bold">
                                  {checkMessage}
                                </div>
                              )}
                              </div>
                              {/* {!gameStarted && isInRoom && (
                                <div className="mt-4 text-center">
                                  <p className="text-gray-600 animate-pulse">Đang chờ đối thủ tham gia...</p>
                                </div>
                              )} */}
                            </div>
                            <div className="flex flex-row pt-3 px-4 py-2 bg-gray-200 border border-gray-400 rounded-md mt-3">
                              <div>
                                <p>
                                  Bạn đang chơi quân{" "}
                                  <span className={`font-bold ${playerColor === "red" ? "text-red-600" : "text-gray-800"}`}>
                                    {playerColor === "red" ? "Đỏ" : "Đen"}
                                  </span>
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

                          <div className="w-full mt-2 h-58 mb-auto overflow-y-auto ml-10 bg-gray-50 border">

                            <div className=" flex flex-col items-center justify-between w-full ">
                            {/* Bảng thời gian bên Trái (Quân Đen) */}
                            <div className={`w-full ${playerColor === "black" ? "bg-red-50 shadow-md" : "bg-gray-50"}`}>
                              <div className="flex flex-row pt-1 space-y-2">
                                <div className="flex text-sm flex-row pr-10">
                                  <div className="">
                                    <div className="flex flex-col mr-3 justify-between items-center">
                                      <span>Tổng thời gian:</span>
                                      <span className="text-xl font-mono">{formatTime(blackTotalTime)}</span>
                                    </div>
                                  </div>
                                  <div className="">
                                    <div className="flex flex-col justify-between items-center">
                                      <span>Giờ/ nước </span>
                                      <span className={`text-xl font-mono ${blackMoveTime < 30 ? "text-yellow-300" : ""}`}>
                                        {formatTime(blackMoveTime)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-row ml-auto">
                                  {currentTurn === "black" && (
                                    <div className=" text-green-600 px-3 py-1 rounded-full text-center animate-pulse">
                                      Đang đi...
                                    </div>
                                  )}
                                  <h3 className="text-lg font-bold text-gray-800 pt-0.5 pr-5">Quân Đen</h3>
                                </div>
                              </div>
                            </div>

                            {/*Add this to your render method, inside the isInRoom section (after the timers or wherever you want to place the chat) */}
                            <div className="w-full max-w-4xl mt-2 h-58 overflow-y-auto bg-gray-50 border">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold pl-3 pt-3 ">Trò chuyện</h3>
                                <div className="px-2 pt-2">
                                  <button 
                                    onClick={() => setShowChat(!showChat)} 
                                    className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 "
                                  >
                                    {showChat ? "Ẩn" : "Hiện"}
                                  </button>
                                </div>
                              </div>
                              
                              {showChat && (
                                <div className="border rounded-lg shadow-sm ">
                                  <div className="h-[21rem] overflow-y-auto p-3 bg-gray-50">

                                    {!gameStarted && isInRoom && (
                                      <div className="mt-4 ">
                                        <p className="text-gray-600 animate-pulse ">Đang chờ đối thủ tham gia...</p>
                                      </div>
                                    )}

                                    {messages.map((msg, index) => (
                                      <div key={index} className="mb-2">
                                        <span className={`font-semibold ${msg.color === "red" ? "text-red-600" : "text-gray-800"}`}>
                                          {msg.sender}:
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
                                </div>
                              )}
                            </div>


                            {/* Bảng thời gian bên Phải (Quân Đỏ) */}
                            <div className={`w-full ${playerColor === "red" ? "bg-red-50 shadow-md" : "bg-gray-50"}`}>
                              <div className="flex flex-row pt-1 space-y-2">
                                <div className="flex text-sm flex-row pr-10">
                                  <div className="">
                                    <div className="flex flex-col mr-3 justify-between items-center">
                                      <span>Tổng thời gian:</span>
                                      <span className="text-xl font-mono">{formatTime(redTotalTime)}</span>
                                    </div>
                                  </div>
                                  <div className="">
                                    <div className="flex flex-col justify-between items-center">
                                      <span>Giờ/ nước </span>
                                      <span className={`text-xl font-mono ${redMoveTime < 30 ? "text-yellow-300" : ""}`}>
                                        {formatTime(redMoveTime)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-row ml-auto">
                                  {currentTurn === "red" && (
                                    <div className=" text-green-600 px-3 py-1 rounded-full text-center animate-pulse">
                                      Đang đi...
                                    </div>
                                  )}
                                  <h3 className="text-lg font-bold text-red-800 pt-0.5 pr-5">Quân Đỏ</h3>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
          </div>
          </main>
        </div>
  );
  
};



export default ChessOnline;