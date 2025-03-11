import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

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

  // Timer logic
  useEffect(() => {
    // Only start the timer when both players have joined
    if (isInRoom && gameStarted && !winnerRef.current) {
      timerIntervalRef.current = setInterval(() => {
        if (currentTurnRef.current === "red") {
          // Decrease red player's time
          const newRedTotalTime = redTotalTimeRef.current - 1;
          const newRedMoveTime = redMoveTimeRef.current - 1;
          
          setRedTotalTime(newRedTotalTime);
          setRedMoveTime(newRedMoveTime);
          
          // Check if time's up
          if (newRedTotalTime <= 0 || newRedMoveTime <= 0) {
            clearInterval(timerIntervalRef.current);
            setWinner("Đen thắng! (Đỏ hết thời gian)");
            socket.emit("gameOver", { roomId, winner: "Đen thắng! (Đỏ hết thời gian)" });
          }
        } else {
          // Decrease black player's time
          const newBlackTotalTime = blackTotalTimeRef.current - 1;
          const newBlackMoveTime = blackMoveTimeRef.current - 1;
          
          setBlackTotalTime(newBlackTotalTime);
          setBlackMoveTime(newBlackMoveTime);
          
          // Check if time's up
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
  }, [isInRoom, gameStarted, roomId]);

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

    socket.on("restartGame", () => {
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
    });


    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("gameStarted");
      socket.off("updateBoard");
      socket.off("updateTimers");
      socket.off("receiveMessage");
      socket.off("gameOver");
      socket.off("restartGame");
    };
  }, []);

  const createRoom = (color) => {
    socket.emit("createRoom", { color });
  };

  const joinRoom = () => {
    socket.emit("joinRoom", { roomId: inputRoomId });
  };
  
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
            className={`w-[40px] h-[40px] flex items-center justify-center cursor-pointer relative
              ${isSelectedCell ? "bg-[rgb(143_0_0_/_83%)]" : ""}
              ${isHighlighted ? "shadow-[0_0_10px_4px_rgba(255,0,0,0.7)]" : ""}
            `}
          >
            {isValidMove && (
              <div className="absolute w-3 h-3 bg-[rgb(143_0_0_/_83%)] rounded-full hover:bg-yellow-500"></div>
            )}
            {piece && <img src={pieceImages[piece]} alt={piece} className="w-8 h-8" />}
          </div>
        );
      })
    );
  };
  

  return (
    <div>
      <div className="flex flex-col items-center mt-10 relative">
        <h1 className="text-2xl font-bold mb-6">Cờ Tướng</h1>
  
        {/* Chỉ hiển thị khi chưa vào phòng */}
        {!isInRoom ? (
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-lg font-semibold mb-2">Tạo hoặc tham gia phòng</h2>
            <div className="flex gap-4">
              <button
                onClick={() => createRoom("red")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
              >
                Tạo phòng (Quân Đỏ)
              </button>
              <button
                onClick={() => createRoom("black")}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900"
              >
                Tạo phòng (Quân Đen)
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                placeholder="Nhập ID phòng"
                className="px-3 py-2 border rounded-lg"
              />
              <button
                onClick={joinRoom}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
              >
                Tham gia phòng
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Hiển thị thông tin phòng */}
            <div className="mb-4 text-center">
              <p className="font-semibold">
                Phòng ID: <span className="text-blue-600">{roomId}</span>
              </p>
              <p>
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
              </p>
            </div>
  
            {/* Chỉ hiển thị bàn cờ và bảng thời gian khi đã vào phòng */}
            <div className="flex flex-row items-center justify-between w-full max-w-4xl px-4">
              {/* Hiển thị thông báo người thắng */}
              {winner && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 rounded-lg shadow-2xl border-4 border-yellow-500 text-center">
                  <h2 className="text-3xl font-bold mb-4">{winner}</h2>
                  <button
                    onClick={() => {
                      socket.emit("restartGame", { roomId });
                      setWinner(null);
                      setBoard(initialBoardState);
                      setSelected(null);
                      setValidMoves([]);
                      setRedTotalTime(600);
                      setBlackTotalTime(600);
                      setRedMoveTime(120);
                      setBlackMoveTime(120);
                      setCurrentTurn("red");
                      setGameStarted(true);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
                  >
                    Chơi lại
                  </button>
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
                    className="relative w-[405px] h-[450px] border-2 border-gray-700 rounded-lg"
                    style={{
                      backgroundImage: "url('/images/board.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >

                {/* Bàn cờ */}
                <div className="grid grid-cols-9 w-[405px] h-[450px] border-2 border-gray-700 relative rounded-lg">
                  {renderBoard()}

                  {/* Hiển thị thông báo Kiểm tra (Check) */}
                  {checkMessage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 text-black text-3xl font-bold">
                      {checkMessage}
                    </div>
                  )}
                  </div>
                  {!gameStarted && isInRoom && (
                    <div className="mt-4 text-center">
                      <p className="text-gray-600">Đang chờ đối thủ tham gia...</p>
                    </div>
                  )}
                </div>

                <div className="">

                  <div className="flex flex-row items-center justify-between w-full max-w-4xl px-4">
                  {/* Bảng thời gian bên Trái (Quân Đen) */}
                  <div className={`w-64 p-4 rounded-lg ${playerColor === "black" ? "bg-gray-100 shadow-md" : "bg-gray-50"}`}>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Quân Đen</h3>
                    <div className="flex flex-col space-y-2">
                      <div className="bg-gray-800 text-white p-3 rounded-md shadow">
                        <div className="flex justify-between items-center">
                          <span>Tổng thời gian:</span>
                          <span className="text-xl font-mono">{formatTime(blackTotalTime)}</span>
                        </div>
                      </div>
                      <div className="bg-gray-700 text-white p-3 rounded-md shadow">
                        <div className="flex justify-between items-center">
                          <span>Giờ/ nước</span>
                          <span className={`text-xl font-mono ${blackMoveTime < 30 ? "text-red-400" : ""}`}>
                            {formatTime(blackMoveTime)}
                          </span>
                        </div>
                      </div>
                      {currentTurn === "black" && (
                        <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-center animate-pulse">
                          Đang đi...
                        </div>
                      )}
                    </div>
                  </div>

                  {/*Add this to your render method, inside the isInRoom section (after the timers or wherever you want to place the chat) */}
                  <div className="w-full max-w-4xl mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Trò chuyện</h3>
                      <button 
                        onClick={() => setShowChat(!showChat)} 
                        className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {showChat ? "Ẩn" : "Hiện"}
                      </button>
                    </div>
                    
                    {showChat && (
                      <div className="border rounded-lg shadow-sm">
                        <div className="h-48 overflow-y-auto p-3 bg-gray-50">
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
                  <div className={`w-64 p-4 rounded-lg ${playerColor === "red" ? "bg-red-50 shadow-md" : "bg-gray-50"}`}>
                    <h3 className="text-lg font-bold text-red-800 mb-2">Quân Đỏ</h3>
                    <div className="flex flex-col space-y-2">
                      <div className="bg-red-800 text-white p-3 rounded-md shadow">
                        <div className="flex justify-between items-center">
                          <span>Tổng thời gian:</span>
                          <span className="text-xl font-mono">{formatTime(redTotalTime)}</span>
                        </div>
                      </div>
                      <div className="bg-red-700 text-white p-3 rounded-md shadow">
                        <div className="flex justify-between items-center">
                          <span>Giờ/ nước </span>
                          <span className={`text-xl font-mono ${redMoveTime < 30 ? "text-yellow-300" : ""}`}>
                            {formatTime(redMoveTime)}
                          </span>
                        </div>
                      </div>
                      {currentTurn === "red" && (
                        <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-center animate-pulse">
                          Đang đi...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
  
};

export default ChessOnline;