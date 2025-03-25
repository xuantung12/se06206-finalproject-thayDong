import React, { useState, useEffect } from "react";
import {
    FaGamepad,
    FaPuzzlePiece,
    FaBook,
    FaCommentDots,
    FaSun,
    FaMoon,
    FaGlobe,
    FaSignOutAlt,
    FaSignInAlt
  } from "react-icons/fa";

import axios from "axios";

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
  
const ChessPuzzle = ({ gameId }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [playMenuOpen, setPlayMenuOpen] = useState(false);
    const [keepOpen, setKeepOpen] = useState(false);
    const [language, setLanguage] = useState("en"); // Trạng thái ngôn ngữ
    const [user, setUser] = useState(null);
    
    const [board, setBoard] = useState(initialBoardState);
    const [selected, setSelected] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [winner, setWinner] = useState(null);
    const [checkMessage, setCheckMessage] = useState(null);
    const [highlightedTargets, setHighlightedTargets] = useState([]);
    const [currentTurn, setCurrentTurn] = useState("black"); // Assuming black goes first
    const [difficultyRating, setDifficultyRating] = useState(0); // Default value 5
    const [savedGames, setSavedGames] = useState([]);
    const [viewMode, setViewMode] = useState(true); // Thêm trạng thái chế độ xem
    const [aiEnabled, setAiEnabled] = useState(true); // Change to true by default
    const [aiSide, setAiSide] = useState("black");
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [selectedGameName, setSelectedGameName] = useState ("");



  useEffect(() => {
    // Gọi API lấy user từ session
    axios.get("http://localhost:3001/session-user", { withCredentials: true })
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
    axios.post("http://localhost:3001/logout", {}, { withCredentials: true })
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



  function MenuItem({ icon, text, isExpanded, link, onClick }) {
    return (
    <a href={link} onClick={onClick} className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
        <span className="text-xl">{icon}</span>
        {isExpanded && <span>{text}</span>}
    </a>
    );
  }

    // Load game if gameId is provided
  useEffect(() => {
    if (gameId) {
      axios.get(`http://localhost:5000/game/${gameId}`)
        .then(response => {
          setBoard(JSON.parse(response.data.board_state));
          setCurrentTurn(response.data.current_turn);
          setDifficultyRating(response.data.difficulty_rating);
        })
        .catch(error => console.error("Error loading game:", error));
    }
    
    // Load saved games list
    fetchSavedGames();
  }, [gameId]);

  const fetchSavedGames = () => {
    axios.get("http://localhost:5000/games")
      .then(response => {
        setSavedGames(response.data);
      })
      .catch(error => console.error("Error fetching saved games:", error));
  };


  const loadGame = (id) => {
    axios.get(`http://localhost:5000/game/${id}`)
      .then(response => {
        setBoard(JSON.parse(response.data.board_state));
        setCurrentTurn("red"); // Always set to red when loading a game
        setDifficultyRating(response.data.difficulty_rating);
        setSelected(null);
        setValidMoves([]);
        setHighlightedTargets([]);
        setWinner(null);
        setCheckMessage(null);
        setViewMode(false); // Switch to play mode
        setAiEnabled(true); // Enable AI when loading a saved game
        setAiSide("black"); // Ensure AI plays as black
      })
      .catch(error => console.error("Error loading game:", error));
  };

useEffect(() => {
  if (aiEnabled && currentTurn === aiSide && !winner && !viewMode) {
    makeAiMove();
  }
}, [aiEnabled, currentTurn, board, winner, viewMode]);

  // Determine piece color: Red or Black
  const getPieceColor = (piece) => {
    if (!piece) return null;
    return "車馬象士將砲兵".includes(piece) ? "black" : "red";
  };

  // Check if the king is in check after a move
  const isKingInCheck = (newBoard) => {
    let redKing = null, blackKing = null;

    // Find positions of the red king (帅) and black king (將)
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c] === "帅") redKing = [r, c];
        if (newBoard[r][c] === "將") blackKing = [r, c];
      }
    }

    // Check if any piece can capture the king
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = newBoard[r][c];
        if (piece) {
          const pieceColor = getPieceColor(piece);
          const moves = findValidMoves(r, c, newBoard);
          for (let [mr, mc] of moves) {
            if (redKing && mr === redKing[0] && mc === redKing[1] && pieceColor === "black") {
              return true;
            }
            if (blackKing && mr === blackKing[0] && mc === blackKing[1] && pieceColor === "red") {
              return true;
            }
          }
        }
      }
    }
    return false;
  };



  // Add this new function to your component:
const makeAiMove = () => {
  if (!aiEnabled || currentTurn !== aiSide || winner) return;
  
  setIsAiThinking(true);
  
  // Use setTimeout to prevent UI freezing during calculation
  setTimeout(() => {
    const bestMove = findBestMove(
      board, 
      aiSide, 
      difficultyRating, 
      isMoveValid, 
      findValidMoves, 
      areKingsFacing
    );
    
    if (bestMove) {
      const { fromRow, fromCol, toRow, toCol, piece } = bestMove;
      const newBoard = board.map((r) => [...r]);
      const capturedPiece = newBoard[toRow][toCol];
      
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = null;
      
      // Check for check
      if (isKingInCheck(newBoard)) {
        setCheckMessage(
          <span className="flex">
            <img
              src="/images/2swords.png"
              alt="Check"
              className="w-20 h-20"
            />
            <p className="mt-5">Check!</p>
          </span>
        );
        setTimeout(() => setCheckMessage(null), 1000);
      }
      
      // Check for king capture (win condition)
      if (capturedPiece === "將") {
        setWinner("Red wins!");
      } else if (capturedPiece === "帅") {
        setWinner("Black wins!");
      }
      
      // Update board state
      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);
      setHighlightedTargets([]);
      
      // Switch turns
      setCurrentTurn(currentTurn === "black" ? "red" : "black");
    }
    
    setIsAiThinking(false);
  }, 10);
};

  // New function to evaluate board position
const evaluateBoard = (board, side) => {
  const pieceValues = {
    // Black pieces (higher rank = higher value)
    "將": 1000,  // General
    "車": 90,    // Chariot
    "馬": 40,    // Horse
    "象": 20,    // Elephant
    "士": 20,    // Advisor
    "砲": 45,    // Cannon
    "兵": 10,    // Soldier
    
    // Red pieces
    "帅": 1000,  // General
    "车": 90,    // Chariot
    "马": 40,    // Horse
    "相": 20,    // Elephant
    "仕": 20,    // Advisor
    "炮": 45,    // Cannon
    "卒": 10     // Soldier
  };
  
  // Position-based bonuses for better strategic positions
  const positionBonus = {
    // Pawns get bonuses for advancing
    "兵": (row, col) => (9 - row) * 2,
    "卒": (row, col) => row * 2,
    
    // Horses and chariots get central position bonuses
    "馬": (row, col) => Math.min(Math.min(col, 8-col), Math.min(row, 9-row)),
    "马": (row, col) => Math.min(Math.min(col, 8-col), Math.min(row, 9-row)),
    "車": (row, col) => Math.min(Math.min(col, 8-col), Math.min(row, 9-row)),
    "车": (row, col) => Math.min(Math.min(col, 8-col), Math.min(row, 9-row)),
    
    // Generals get bonus for central palace position
    "將": (row, col) => (col === 4 && row === 1) ? 5 : 0,
    "帅": (row, col) => (col === 4 && row === 8) ? 5 : 0
  };
  
  let score = 0;
  
  // Evaluate material and position
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceColor = "車馬象士將砲兵".includes(piece) ? "black" : "red";
        const pieceValue = pieceValues[piece] || 0;
        const bonus = positionBonus[piece] ? positionBonus[piece](row, col) : 0;
        
        // Add value if it's the AI's piece, subtract if it's the opponent's
        if ((side === "black" && pieceColor === "black") || 
            (side === "red" && pieceColor === "red")) {
          score += pieceValue + bonus;
        } else {
          score -= pieceValue + bonus;
        }
      }
    }
  }
  
  return score;
};

// Check if the game is over (king capture)
const isGameOver = (board) => {
  let blackKing = false;
  let redKing = false;
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === "將") blackKing = true;
      if (board[row][col] === "帅") redKing = true;
    }
  }
  
  return !blackKing || !redKing;
};

// Generate all possible moves for a side
const generateAllMoves = (board, side, isMoveValid, findValidMoves) => {
  let allMoves = [];
  
  for (let fromRow = 0; fromRow < 10; fromRow++) {
    for (let fromCol = 0; fromCol < 9; fromCol++) {
      const piece = board[fromRow][fromCol];
      if (!piece) continue;
      
      const pieceColor = "車馬象士將砲兵".includes(piece) ? "black" : "red";
      if (pieceColor !== side) continue;
      
      const validMoves = findValidMoves(fromRow, fromCol, board);
      for (const [toRow, toCol] of validMoves) {
        allMoves.push({
          fromRow,
          fromCol,
          toRow,
          toCol,
          piece
        });
      }
    }
  }
  
  return allMoves;
};

// Make a move on a copy of the board
const makeMove = (board, move) => {
  const newBoard = board.map(row => [...row]);
  newBoard[move.toRow][move.toCol] = move.piece;
  newBoard[move.fromRow][move.fromCol] = null;
  return newBoard;
};

// Minimax algorithm with Alpha-Beta pruning
const minimax = (board, depth, alpha, beta, maximizingPlayer, side, isMoveValid, findValidMoves, areKingsFacing) => {
  // Base case: we've reached the maximum depth or the game is over
  if (depth === 0 || isGameOver(board)) {
    return evaluateBoard(board, side);
  }
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    const moves = generateAllMoves(board, side, isMoveValid, findValidMoves);
    
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      
      // Skip invalid moves that would cause kings to face each other
      if (areKingsFacing(newBoard)) continue;
      
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, side, isMoveValid, findValidMoves, areKingsFacing);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-Beta pruning
    }
    
    return maxEval;
  } else {
    let minEval = Infinity;
    const opponentSide = side === "black" ? "red" : "black";
    const moves = generateAllMoves(board, opponentSide, isMoveValid, findValidMoves);
    
    for (const move of moves) {
      const newBoard = makeMove(board, move);
      
      // Skip invalid moves that would cause kings to face each other
      if (areKingsFacing(newBoard)) continue;
      
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, side, isMoveValid, findValidMoves, areKingsFacing);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-Beta pruning
    }
    
    return minEval;
  }
};

// Function to find the best move for the AI
const findBestMove = (board, side, difficultyRating, isMoveValid, findValidMoves, areKingsFacing) => {
  // Determine search depth based on difficulty rating
  // Higher difficulty = deeper search
  const depthMap = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
    7: 4,
    8: 4,
    9: 5,
    10: 6
    
  };
  
  const searchDepth = depthMap[difficultyRating] || 3;
  
  let bestMove = null;
  let bestScore = -Infinity;
  
  const moves = generateAllMoves(board, side, isMoveValid, findValidMoves);
  
  // Add some randomness to make AI less predictable
  const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);
  
  for (const move of shuffledMoves) {
    const newBoard = makeMove(board, move);
    
    // Skip invalid moves that would cause kings to face each other
    if (areKingsFacing(newBoard)) continue;
    
    // For higher difficulties, use the full minimax with alpha-beta pruning
    let score;
    if (difficultyRating >= 3) {
      score = minimax(newBoard, searchDepth - 1, -Infinity, Infinity, false, side, isMoveValid, findValidMoves, areKingsFacing);
    } else {
      // For lower difficulties, just use basic evaluation + some randomness
      score = evaluateBoard(newBoard, side) + (Math.random() * 10);
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
};

  const isMoveValid = (piece, fromRow, fromCol, toRow, toCol, boardState = board) => {
    // Không cho phép di chuyển đến ô không có gì
    if (fromRow === toRow && fromCol === toCol) return false;
    
    const targetPiece = boardState[toRow][toCol];
    const pieceColor = getPieceColor(piece);
    const targetPieceColor = getPieceColor(targetPiece);

    // If target cell has a piece of the same color -> Invalid
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
          ((pieceColor === "black" && toRow < 5) || (pieceColor === "red" && toRow >= 5)) &&
          boardState[(fromRow + toRow) / 2][(fromCol + toCol) / 2] === null
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
            if (boardState[fromRow][col]) return false;
          }
          return true;
        } else if (fromCol === toCol) {
          const minRow = Math.min(fromRow, toRow);
          const maxRow = Math.max(fromRow, toRow);
          for (let row = minRow + 1; row < maxRow; row++) {
            if (boardState[row][fromCol]) return false;
          }
          return true;
        }
        return false;
      case "馬":
      case "马":
        return (
          (rowDiff === 2 && colDiff === 1 && !boardState[fromRow + (toRow > fromRow ? 1 : -1)][fromCol]) ||
          (rowDiff === 1 && colDiff === 2 && !boardState[fromRow][fromCol + (toCol > fromCol ? 1 : -1)])
        );
      case "砲":
      case "炮":
        let count = 0;
        if (fromRow === toRow) {
          const minCol = Math.min(fromCol, toCol);
          const maxCol = Math.max(fromCol, toCol);
          for (let col = minCol + 1; col < maxCol; col++) {
            if (boardState[fromRow][col]) count++;
          }
        } else if (fromCol === toCol) {
          const minRow = Math.min(fromRow, toRow);
          const maxRow = Math.max(fromRow, toRow);
          for (let row = minRow + 1; row < maxRow; row++) {
            if (boardState[row][fromCol]) count++;
          }
        } else {
          return false;
        }

        // Nếu ô đích không có quân cờ -> Không được có vật cản
        if (!targetPiece) return count === 0;

        // Nếu ô đích có quân cờ -> Phải có đúng 1 vật cản ở giữa
        return count === 1;
      default:
        return false;
    }
  };

  const findValidMoves = (row, col, boardState = board) => {
    const piece = boardState[row][col];
    let moves = [];

    if (!piece) return moves;

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (isMoveValid(piece, row, col, r, c, boardState)) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  };

  

  const handleCellClick = (row, col) => { 
    if (viewMode) {
      alert("Bạn đang ở chế độ xem");
      return;
    }
    
    // If it's AI's turn and AI is enabled, prevent human moves
    if (aiEnabled && currentTurn === aiSide) {
      alert(`Chờ AI ${aiSide === "black" ? "đen" : "đỏ"} đang suy nghĩ...`);
      return;
    }
    
    if (winner) return; // If there's already a winner, don't allow moves

    const clickedPiece = board[row][col];
    const clickedPieceColor = getPieceColor(clickedPiece);

    // If selecting a new piece when another piece is already selected
    if (selected) {
      const { row: fromRow, col: fromCol } = selected;
      const selectedPiece = board[fromRow][fromCol];
      const selectedPieceColor = getPieceColor(selectedPiece);

      // If clicking on same piece, deselect it
      if (fromRow === row && fromCol === col) {
        setSelected(null);
        setValidMoves([]);
        setHighlightedTargets([]);
        return;
      }

      // If clicking on a different piece of the same color, switch selection
      if (clickedPiece && clickedPieceColor === currentTurn) {
        setSelected({ row, col });
        const moves = findValidMoves(row, col);
        setValidMoves(moves);

        // Identify which pieces can be captured
        const targets = moves.filter(([r, c]) => board[r][c] !== null);
        setHighlightedTargets(targets);
        return;
      }

      // If clicking on a valid move destination, attempt to move
      if (validMoves.some(([r, c]) => r === row && c === col)) {
        // Execute the move
        const newBoard = board.map((r) => [...r]);
        const capturedPiece = newBoard[row][col];
        newBoard[row][col] = selectedPiece;
        newBoard[fromRow][fromCol] = null;

        // Check if kings are facing each other (not allowed)
        if (areKingsFacing(newBoard)) {
          alert("Kings cannot face each other directly!");
          return;
        }

        // Check for check
        if (isKingInCheck(newBoard)) {
          setCheckMessage(
            <span className="flex">
              <img
                src="/images/2swords.png"
                alt="Check"
                className="w-20 h-20"
              />
              <p className="mt-5">Chiếu Tướng!</p>
            </span>
          );
          setTimeout(() => setCheckMessage(null), 1000);
        }

        // Check for king capture (win condition)
        if (capturedPiece === "將") {
          setWinner("You Loss!");
        } else if (capturedPiece === "帅") {
          setWinner("You Win!");
        }

        // Update board state
        setBoard(newBoard);
        setSelected(null);
        setValidMoves([]);
        setHighlightedTargets([]);
        
        // Switch turns
        setCurrentTurn(currentTurn === "black" ? "red" : "black");
        return;
      }
    }

    // If no piece is selected or clicked on non-valid move destination
    if (clickedPiece && clickedPieceColor === currentTurn) {
      setSelected({ row, col });
      const moves = findValidMoves(row, col);
      setValidMoves(moves);

      // Identify pieces that can be captured and highlight them
      const targets = moves.filter(([r, c]) => board[r][c] !== null); 
      setHighlightedTargets(targets);
    } else {
      setSelected(null);
      setValidMoves([]);
      setHighlightedTargets([]);
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
      // Check for obstacles between the two kings
      for (let r = Math.min(blackKingRow, redKingRow) + 1; r < Math.max(blackKingRow, redKingRow); r++) {
        if (board[r][blackKingCol]) return false;
      }
      return true; // Kings are facing each other
    }

    return false;
  };

  const restartGame = () => {
    setBoard(initialBoardState);
    setWinner(null);
    setSelected(null);
    setValidMoves([]);
    setHighlightedTargets([]);
    setCurrentTurn("red"); // Change to "red" so red goes first
    setViewMode(true); // Change to false to start in play mode
    setAiEnabled(true); // Enable AI by default
    setAiSide("black"); // Set AI to play as black
  };

  // Tạo các sao để hiển thị mức độ khó
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span 
          key={i} 
          className={`text-xl cursor-pointer ${i <= rating ? "text-yellow-500" : "text-gray-300"}`}
          onClick={() => setDifficultyRating(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={`flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
          {/* Sidebar */}
          <div className="">
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
                    <MenuItem icon={<FaGamepad />} text={language === "en" ? "Play Now" : "Chơi Ngay"} isExpanded={isExpanded} link="/home-page-client" />
                    </div>
                    <MenuItem icon={<FaPuzzlePiece />} text={language === "en" ? "Puzzles" : "Câu đố"} isExpanded={isExpanded} link="/chess-puzzle-client" />
                    <MenuItem icon={<FaBook />} text={language === "en" ? "Course" : "Khóa Học"} isExpanded={isExpanded} link="/chess-courses-client" />
                    <MenuItem icon={<FaCommentDots />} text={language === "en" ? "Chat" : "Trò chuyện"} isExpanded={isExpanded} link="/chess-chat-client" />
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
                      <MenuItem icon={<FaSignInAlt />} text={language === "en" ? "Sign In" : "Đăng nhập"} isExpanded={isExpanded} link="/chess-login-client" />
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
                    <a href="/chess-offline-client" className="block p-3 hover:bg-gray-200"><img src="images/play-computer-sm.svg"></img> {language === "en" ? "Play vs Computer" : "Chơi với máy"}</a>
                        <a href="/chess-online-client" className="block p-3 hover:bg-gray-200"><img src="images/challenge-friends.svg"></img>{language === "en" ? "Play Online" : "Chơi trực tuyến"}</a>
                        <a href="/option3" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 3" : "Tùy chỉnh 3"}</a>
                        <a href="/option4" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 4" : "Tùy chỉnh 4"}</a>
                  </div>
                )}
            </div>
    
    
          {/*//////////////////////////// Main Content//////////////////////////////////////////////////////////////// */}
          <main className="flex-1 flex flex-col items-center justify-center ">
          {/* <div className=" w-[100%] h-auto absolute bottom-0 left-0 size-16 pointer-events-none">
            <img src="images/96857e5411a903ed226e3c87e54cc29c (1).svg" alt="Ảnh mẫu"
            class="w-[100%] h-auto"></img>
          </div> */}

          <div className=" w-[100%] h-auto absolute bottom-0 left-0 size-16 pointer-events-none">
            <img src="/images/sonha.svg" alt="Ảnh mẫu"
            class="w-[100%] h-auto"></img>
          </div>
          
          <div className="flex flex-col items-center ">
            {/* <h1 className="text-2xl font-bold mb-6">Cờ Tướng</h1> */}
            <div className="flex ">
                {/* Game controls */}
              <div className="flex flex-col items-center">
                <div className="mb-4 flex gap-4 items-center">
                  
                  <div className="flex items-center">
                    {/* <span className="">ten game:</span> */}
                    <div className="p-2 w-[280px] break-words whitespace-normal">{selectedGameName}</div>
                  </div>

                  <div className="flex items-center">
                    <span className="mr-2">Độ khó:</span>
                    <div className="flex">
                      {renderStars(difficultyRating)}
                    </div>
                    <span className="ml-2">{difficultyRating}/10</span>
                  </div>
                </div>

                {/* Game mode indicator */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    Current Turn: {currentTurn === "black" ? "Black" : "Red"}
                  </span>
                  <span className={`ml-4 px-3 py-1 rounded-full text-white ${viewMode ? "bg-red-500" : "bg-green-500"}`}>
                    {viewMode ? "Chế độ xem" : "Chế độ chơi"}
                  </span>
                  <button 
                    onClick={restartGame} 
                    className="px-4 py-2 ml-10 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    New Game
                  </button>
                </div>
                
                
                {/* Board container with background */}
                <div
                  className="grid grid-cols-9 w-[483px] h-[547px] border-2 border-gray-700 relative rounded-lg"
                  style={{
                    backgroundImage: "url('/images/board.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Board */}
                  <div className="grid grid-cols-9 w-[483px] h-[547px] border-2 border-gray-700 relative rounded-lg">
                    {board.map((row, rowIndex) =>
                      row.map((piece, colIndex) => {
                        const isHighlighted = highlightedTargets.some(([r, c]) => r === rowIndex && c === colIndex);
                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            className={`w-[50px] h-[51px] flex items-center justify-center cursor-pointer relative 
                              ${selected?.row === rowIndex && selected?.col === colIndex ? "bg-[rgb(143_0_0_/_83%)]" : ""}
                              ${isHighlighted ? "shadow-[0_0_10px_4px_rgba(255,0,0,0.7)]" : ""}
                              ${viewMode || (aiEnabled && currentTurn === aiSide) ? "cursor-not-allowed" : ""}
                            `}
                          >
                            {!viewMode && validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && (
                              <div className="absolute w-4 h-4 bg-[rgb(143_0_0_/_83%)] rounded-full hover:bg-yellow-500"></div>
                            )}
                            {piece && <img src={pieceImages[piece]} alt={piece} className="w-10 h-10" />}
                          </div>
                        );
                      })
                    )}
            
                    {checkMessage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 text-black text-3xl font-bold">
                        {checkMessage}
                      </div>
                    )}
            
                    {/* AI thinking indicator overlay */}
                    {!viewMode && aiEnabled && isAiThinking && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 pointer-events-none">
                        <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
                          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-lg font-medium">AI is thinking...</span>
                        </div>
                      </div>
                    )}
            
                    {/* Win/Loss message */}
                    {winner && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 pointer-events-none">
                        <span className="text-5xl font-extrabold text-white drop-shadow-2xl animate-pulse mb-6">
                          {winner} 
                        </span>
                        
                        {/* Restart button */}
                        <button
                          onClick={restartGame}
                          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 pointer-events-auto"
                        >
                          Play Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="pl-5 ">
                {/* Saved games list */}
                {savedGames.length > 0 && (
                          <div className="ml-8 w-[650px]">
                          <h2  className="text-xl font-bold mb-2">Saved Games</h2>
                          <div className="max-h-[620px] overflow-y-auto border border-gray-300 rounded-md"
                              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                              <table className="w-full">
                              <thead className="">
                                  <tr>
                                  <th className="p-2 w-[14.5rem] text-left">Name</th>
                                  <th className="p-2 text-center">Difficulty</th>
                                  <th className="p-2 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedGames.map(game => (
                            <tr 
                              key={game.id} 
                              className="hover:bg-gray-100 cursor-pointer border-t border-gray-200"
                              onClick={() => {
                                setSelectedGameName(game.name)
                                loadGame(game.id)}}
                            >
                              <td className="w-[15px] max-w-[15px] break-words whitespace-pre-wrap p-2">{game.name}</td>
                              <td className="p-2 text-center">
                                <div className="flex justify-center">
                                  <span className="text-yellow-500">
                                    <div className="flex">
                                      {Array.from({length: 10}, (_, i) => (
                                        <span key={i} className={`text-xl ${i < game.difficulty_rating ? "text-yellow-500" : "text-gray-300"}`}>★</span>
                                      ))}
                                    </div>
                                  </span>
                                  <div>
                                    {game.difficulty_rating}/10
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 text-right text-sm text-gray-500">
                                {new Date(game.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          </main>
    </div>
  );
};

export default ChessPuzzle;