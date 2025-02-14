import React, { useState } from "react";
import "./index.css";

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
  ["车", "马", "象", "士", "帅", "士", "象", "马", "车"],
];

const App = () => {
  const [board, setBoard] = useState(initialBoardState);
  const [selected, setSelected] = useState(null);

  const isMoveValid = (piece, fromRow, fromCol, toRow, toCol) => {
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
        return (
          toCol >= 3 &&
          toCol <= 5 &&
          ((toRow >= 0 && toRow <= 2) || (toRow >= 7 && toRow <= 9)) &&
          rowDiff === 1 &&
          colDiff === 1
        );
      case "象":
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
        if (fromRow === toRow) {
          const minCol = Math.min(fromCol, toCol);
          const maxCol = Math.max(fromCol, toCol);
          let count = 0;
          for (let col = minCol + 1; col < maxCol; col++) {
            if (board[fromRow][col]) count++;
          }
          return count === 1;
        } else if (fromCol === toCol) {
          const minRow = Math.min(fromRow, toRow);
          const maxRow = Math.max(fromRow, toRow);
          let count = 0;
          for (let row = minRow + 1; row < maxRow; row++) {
            if (board[row][fromCol]) count++;
          }
          return count === 1;
        }
        return false;
      default:
        return false;
    }
  };

  const handleCellClick = (row, col) => {
    if (selected) {
      const { row: fromRow, col: fromCol } = selected;
      const piece = board[fromRow][fromCol];
      if (fromRow === row && fromCol === col) {
        setSelected(null); // Bỏ chọn khi nhấn lại cùng một ô
      } else if (isMoveValid(piece, fromRow, fromCol, row, col)) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = piece;
        newBoard[fromRow][fromCol] = null;
        setBoard(newBoard);
        setSelected(null);
      } else {
        setSelected(null);
      }
    } else if (board[row][col]) {
      setSelected({ row, col });
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-6">Cờ Tướng</h1>
      <div className="grid grid-cols-9 w-[540px] h-[600px] border-2 border-gray-700">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`border border-gray-400 w-[60px] h-[60px] flex items-center justify-center cursor-pointer ${
                (rowIndex + colIndex) % 2 === 0 ? "bg-gray-100" : "bg-green-200"
              } ${selected?.row === rowIndex && selected?.col === colIndex ? "bg-yellow-300" : ""}`}
            >
              {piece && (
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
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

export default App;
