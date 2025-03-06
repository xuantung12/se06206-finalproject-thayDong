import React, { useState } from "react";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { Link } from "react-router-dom";


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
  const [checkMessage, setCheckMessage] = useState(null); // Trạng thái hiển thị "Chiếu tướng"
  const [highlightedTargets, setHighlightedTargets] = useState([]);
  

  const [roomId, setRoomId] = useState("");
  const [playerColor, setPlayerColor] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("red");
  const [isInRoom, setIsInRoom] = useState(false);
  const [inputRoomId, setInputRoomId] = useState("");

  const isBlackPiece = (piece) => ["將", "士", "象", "馬", "車", "砲", "兵"].includes(piece);
  const isRedPiece = (piece) => ["帅", "仕", "相", "马", "车", "炮", "卒"].includes(piece);


  // Xác định màu quân cờ: Đỏ hoặc Đen
  const getPieceColor = (piece) => {
    if (!piece) return null;
    return "車馬象士將砲兵".includes(piece) ? "black" : "red";
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
    });

    socket.on("updateBoard", ({ board, turn }) => {
      setBoard(board);
      setCurrentTurn(turn);
    });

    // Lắng nghe sự kiện gameOver từ server
  socket.on("gameOver", (winnerMessage) => {
    setWinner(winnerMessage);
  });

  // Lắng nghe sự kiện restartGame để reset lại trạng thái game
  socket.on("restartGame", () => {
    setBoard(initialBoardState);
    setWinner(null);
    setSelected(null);
    setValidMoves([]);
  });

    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("updateBoard");
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
    if (!isInRoom || playerColor !== currentTurn) return;
    
    // Chuyển đổi tọa độ hiển thị thành tọa độ thực tế
    const [realFromRow, realFromCol] = convertToRealCoords(fromRow, fromCol);
    const [realToRow, realToCol] = convertToRealCoords(toRow, toCol);
    
    const newBoard = [...board.map(row => [...row])];
    newBoard[realToRow][realToCol] = newBoard[realFromRow][realFromCol];
    newBoard[realFromRow][realFromCol] = null;

    const nextTurn = currentTurn === "red" ? "black" : "red";

    socket.emit("move", { roomId, board: newBoard, turn: nextTurn });

    setBoard(newBoard);
    setCurrentTurn(nextTurn);
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
        // Chuyển đổi tọa độ hiển thị để kiểm tra nước đi hợp lệ
        
        
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

            // Kiểm tra nếu hai tướng đối diện nhau -> Không hợp lệ
            if (areKingsFacing(newBoard)) {
                return;
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
              socket.emit("move", { roomId, board: newBoard, turn: nextTurn, winner: gameWinner });
            } else {
              socket.emit("move", { roomId, board: newBoard, turn: nextTurn });
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

  if (blackKingCol === redKingCol) {
    // Kiểm tra có vật cản giữa hai tướng không
    for (let r = Math.min(blackKingRow, redKingRow) + 1; r < Math.max(blackKingRow, redKingRow); r++) {
      if (board[r][blackKingCol]) return false;
    }
    return true; // Hai tướng đối diện nhau
  }

  return false;
};

// Hàm render bàn cờ dựa vào màu người chơi
const renderBoard = () => {
  // Nếu là người chơi quân đen, lật bàn cờ
  const boardToRender = playerColor === "black" 
    ? [...Array(10)].map((_, rowIndex) => 
        [...Array(9)].map((_, colIndex) => 
          board[9 - rowIndex][8 - colIndex]
        )
      )
    : board;
  
  return boardToRender.map((row, rowIndex) =>
    row.map((piece, colIndex) => {
      // Tính toán tọa độ thực tế để kiểm tra highlight
      
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
  {/* Thanh Navigation */}
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
              <div className="flex items-center">
                <img src="/images/chess-piece.png" alt="Cờ Tướng" className="w-10 h-10 mr-2" />
                <span className="text-xl font-bold">Cờ Tướng</span>
              </div>
              <ul className="flex space-x-6">
                <li>
                  <Link to="/" className="hover:text-yellow-400 transition duration-300">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link to="/chess-offline" className="hover:text-yellow-400 transition duration-300">
                    Chơi với máy
                  </Link>
                </li>
                <li>
                  <Link to="/chess-online" className="hover:text-yellow-400 transition duration-300">
                    Chơi Online
                  </Link>
                </li>
                <li>
                  <Link to="/chess-chat" className="hover:text-yellow-400 transition duration-300">
                    Phòng CHat Cộng đồng 
                  </Link>
                </li><li>
                  <Link to="/chess-courses" className="hover:text-yellow-400 transition duration-300">
                    KHóa Học
                  </Link>
                </li><li>
                  <Link to="/chess-register" className="hover:text-yellow-400 transition duration-300">
                    Đăng Kí
                  </Link>
                </li><li>
                  <Link to="/chess-login" className="hover:text-yellow-400 transition duration-300">
                    Đăng Nhập
                  </Link>
                </li>
              </ul>
      </nav>

  <div className="flex flex-col items-center mt-10 relative">
    <h1 className="text-2xl font-bold mb-6">Cờ Tướng</h1>

    {/* Tạo và tham gia phòng */}
    {!isInRoom ? (
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-lg font-semibold mb-2">Tạo hoặc tham gia phòng</h2>
        <div className="flex gap-4">
          <button
            onClick={() => createRoom("red")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
          >
            Tạo phòng (Chơi Đỏ)
          </button>
          <button
            onClick={() => createRoom("black")}
            className="px-4 py-2 bg-black text-white rounded-lg shadow-md hover:bg-gray-800"
          >
            Tạo phòng (Chơi Đen)
          </button>
        </div>

        <div className="flex mt-4 gap-2">
          <input
            type="text"
            placeholder="Nhập ID phòng"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            className="border rounded px-3 py-1"
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
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-lg font-semibold">Phòng: {roomId} - Bạn đang chơi: {playerColor === "red" ? "Đỏ" : "Đen"}</h2>
        <h3 className="text-md text-gray-700">Lượt hiện tại: {currentTurn === "red" ? "Đỏ" : "Đen"}</h3>
      </div>
    )}

    {/* Vùng chứa bàn cờ với hình nền */}
    <div
      className="relative w-[405px] h-[450px] border-2 border-gray-700"
      style={{
        backgroundImage: "url('/images/board.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Bàn cờ */}
      <div className="grid grid-cols-9 w-[405px] h-[450px] border-2 border-gray-700 relative">
        {renderBoard()}

        {/* Hiển thị thông báo Kiểm tra (Check) */}
        {checkMessage && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 text-black text-3xl font-bold">
            {checkMessage}
          </div>
        )}

        {winner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 pointer-events-none">
            <span className="text-5xl font-extrabold text-white drop-shadow-2xl animate-pulse mb-6">
              {winner}
            </span>
            {/* Nút Restart */}
            <button
              onClick={() => {
                socket.emit("restartGame", { roomId, initialBoardState });
              }}
              className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 pointer-events-auto"
            >
              Chơi lại
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  </div>
);
};

export default ChessOnline;