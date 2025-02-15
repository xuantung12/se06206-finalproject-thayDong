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

const ChessOffline = () => {
  const [board, setBoard] = useState(initialBoardState);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [winner, setWinner] = useState(null);

  // Xác định màu quân cờ: Đỏ hoặc Đen
  const getPieceColor = (piece) => {
    if (!piece) return null;
    return "車馬象士將砲兵".includes(piece) ? "red" : "black";
  };

  const isMoveValid = (piece, fromRow, fromCol, toRow, toCol) => {
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


  const findValidMoves = (row, col) => {
    const piece = board[row][col];
    let moves = [];
  
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (isMoveValid(piece, row, col, r, c)) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  };
  
  const handleCellClick = (row, col) => {
    if (winner) return; // Nếu đã có người thắng, không cho phép tiếp tục
  
    if (selected) {
      const { row: fromRow, col: fromCol } = selected;
      const piece = board[fromRow][fromCol];
  
      if (fromRow === row && fromCol === col) {
        setSelected(null);
        setValidMoves([]);
      } else if (isMoveValid(piece, fromRow, fromCol, row, col)) {
        const newBoard = board.map((r) => [...r]);
        const targetPiece = newBoard[row][col];
  
        // Kiểm tra nếu ăn Tướng
        if (targetPiece === "將") {
          setWinner("Đen thắng!");
        } else if (targetPiece === "帅") {
          setWinner("Đỏ thắng!");
        }
  
        newBoard[row][col] = piece;
        newBoard[fromRow][fromCol] = null;
        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);
      }
    } else if (board[row][col]) {
      setSelected({ row, col });
      setValidMoves(findValidMoves(row, col));
    }
  };
  

  return (
    
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-6">Cờ Tướng</h1>
      <div className="grid grid-cols-9 w-[360px] h-[400px] border-2 border-gray-700">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`border border-gray-400 w-[40px] h-[40px] flex items-center justify-center cursor-pointer ${
                (rowIndex + colIndex) % 2 === 0 ? "bg-gray-100" : "bg-green-200"
              } ${selected?.row === rowIndex && selected?.col === colIndex ? "bg-yellow-300" : ""}`}
            >
              {validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && (
                <div className="absolute w-3 h-3 bg-yellow-400 rounded-full"></div>
              )}
              {piece && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    ["車", "馬", "象", "士", "將", "砲", "兵"].includes(piece)
                      ? "bg-red-600 text-white"
                      : "bg-red-600 text-black"
                  }`}
                >
                  {piece}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};  

export default ChessOffline;