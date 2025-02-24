import React, { useState } from "react";



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

  // Xác định màu quân cờ: Đỏ hoặc Đen
  const getPieceColor = (piece) => {
    if (!piece) return null;
    return "車馬象士將砲兵".includes(piece) ? "black" : "red";
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

  
  const isMoveValid = (piece, fromRow, fromCol, toRow, toCol, boardState = board ) => {
    const targetPiece = board[toRow][toCol];
    const pieceColor = getPieceColor(piece);
    const targetPieceColor = getPieceColor(targetPiece);

    // Nếu ô đích có quân cùng màu -> Không hợp lệ
    if (targetPiece && pieceColor === targetPieceColor) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece) {
      case "將":
      case "帅":
        return (
          toCol >= 3 &&
          toCol <= 5 &&
          ((toRow >= 0 && toRow <= 2) || (toRow >= 7 && toRow <= 9)) &&
          rowDiff + colDiff === 1
        );
      case "士":
      case "仕":
        return (
          toCol >= 3 &&
          toCol <= 5 &&
          ((toRow >= 0 && toRow <= 2) || (toRow >= 7 && toRow <= 9)) &&
          rowDiff === 1 &&
          colDiff === 1
        );
      case "象":
      case "相":
        return (
          rowDiff === 2 &&
          colDiff === 2 &&
          ((fromRow < 5 && toRow < 5) || (fromRow >= 5 && toRow >= 5)) &&
          board[(fromRow + toRow) / 2][(fromCol + toCol) / 2] === null
        );
      case "兵":
        return (
          (toRow > fromRow && rowDiff === 1 && colDiff === 0) ||
          (fromRow >= 5 && rowDiff === 0 && colDiff === 1)
        );
      case "卒":
        return (
          (toRow < fromRow && rowDiff === 1 && colDiff === 0) ||
          (fromRow <= 4 && rowDiff === 0 && colDiff === 1)
        );
      case "車":
      case "车":
        if (fromRow === toRow) {
          const minCol = Math.min(fromCol, toCol);
          const maxCol = Math.max(fromCol, toCol);
          for (let col = minCol + 1; col < maxCol; col++) {
            if (board[fromRow][col]) return false;
          }
          return true;
        } else if (fromCol === toCol) {
          const minRow = Math.min(fromRow, toRow);
          const maxRow = Math.max(fromRow, toRow);
          for (let row = minRow + 1; row < maxRow; row++) {
            if (board[row][fromCol]) return false;
          }
          return true;
        }
        return false;
      case "馬":
      case "马":
        return (
          (rowDiff === 2 && colDiff === 1 && !board[(fromRow + toRow) / 2][fromCol]) ||
          (rowDiff === 1 && colDiff === 2 && !board[fromRow][(fromCol + toCol) / 2])
        );
      case "砲":
      case "炮":
        let count = 0;
        if (fromRow === toRow) {
          const minCol = Math.min(fromCol, toCol);
          const maxCol = Math.max(fromCol, toCol);
          for (let col = minCol + 1; col < maxCol; col++) {
            if (board[fromRow][col]) count++;
          }
        } else if (fromCol === toCol) {
          const minRow = Math.min(fromRow, toRow);
          const maxRow = Math.max(fromRow, toRow);
          for (let row = minRow + 1; row < maxRow; row++) {
            if (board[row][fromCol]) count++;
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
    const piece = boardState[row][col];
    let moves = [];

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (isMoveValid(piece, row, col, r, c, boardState)) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  };
  // 55555555//  666//
  const handleCellClick = (row, col) => {
    if (winner) return; // Nếu đã có người thắng, không cho phép tiếp tục

    if (selected) {
        const { row: fromRow, col: fromCol } = selected;
        const piece = board[fromRow][fromCol];

        if (fromRow === row && fromCol === col) {
            setSelected(null);
            setValidMoves([]);
            setHighlightedTargets([]); // Xóa highlight các quân bị đe dọa
        } else if (isMoveValid(piece, fromRow, fromCol, row, col)) {
            const newBoard = board.map((r) => [...r]);
            const targetPiece = newBoard[row][col];

            // Thử di chuyển quân cờ
            newBoard[row][col] = piece;
            newBoard[fromRow][fromCol] = null;

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

            // Nếu quân cờ vừa di chuyển làm hai tướng đối diện -> Không hợp lệ
            if (areKingsFacing(newBoard)) {
                return;
            }

            // Kiểm tra nếu ăn tướng
            if (targetPiece === "將") {
                setWinner("Đen thắng!");
            } else if (targetPiece === "帅") {
                setWinner("Trắng thắng!");
            }


            
            setBoard(newBoard);
            setSelected(null);
            setValidMoves([]);
            setHighlightedTargets([]); // Xóa highlight
        }
    } else if (board[row][col]) {
        setSelected({ row, col });
        const moves = findValidMoves(row, col);
        setValidMoves(moves);

        // Xác định các quân cờ có thể bị ăn và highlight chúng
        const targets = moves.filter(([r, c]) => board[r][c] !== null); 
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


  return (
    <div>
      {/* Bàn cờ */}
      <div className="flex flex-col items-center mt-10 relative">
        <h1 className="text-2xl font-bold mb-6">Cờ Tướng</h1>

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
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
                const isHighlighted = highlightedTargets.some(([r, c]) => r === rowIndex && c === colIndex);
                return (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`w-[40px] h-[40px] flex items-center justify-center cursor-pointer relative
                          ${selected?.row === rowIndex && selected?.col === colIndex ? "bg-[rgb(143_0_0_/_83%)]" : ""}
                          ${isHighlighted ? "shadow-[0_0_10px_4px_rgba(255,0,0,0.7)]" : ""}
                      `}
                    >
                        {validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && (
                            <div className="absolute w-3 h-3 bg-[rgb(143_0_0_/_83%)] rounded-full hover:bg-yellow-500"></div>
                        )}

                        {piece && <img src={pieceImages[piece]} alt={piece} className="w-8 h-8" />}
                    </div>
                );
            })
        )}

          {checkMessage && (
          <div className="absolute inset-0 flex items-center justify-center  bg-opacity-50 text-black text-3xl font-bold">
            {checkMessage}
          </div>
        )}

            {/* Hiển thị thông báo Thắng/Thua */}
            {winner && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 pointer-events-none">
                <span className="text-5xl font-extrabold text-white drop-shadow-2xl animate-pulse mb-6">
                  {winner} 
                </span>
                
                {/* Nút Restart */}
                <button
                  onClick={() => {
                    setBoard(initialBoardState);
                    setWinner(null);
                    setSelected(null);
                    setValidMoves([]);
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
