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
  const [gameName, setGameName] = useState("");
  const [difficultyRating, setDifficultyRating] = useState(0); // Default value 5
  const [savedGames, setSavedGames] = useState([]);
  const [games, setGames] = useState([]); // 🛠️ Đảm bảo khai báo trước khi sử dụng



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



    useEffect(() => {
        axios.get("http://150.95.111.7:5000/games")
        .then(response => setGames(response.data))
        .catch(error => console.error("Lỗi khi tải danh sách ván cờ:", error));
    }, []);


  // Load game if gameId is provided
  useEffect(() => {
    if (gameId) {
      axios.get(`http://150.95.111.7:5000/game/${gameId}`)
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
    axios.get("http://150.95.111.7:5000/games")
      .then(response => {
        setSavedGames(response.data);
      })
      .catch(error => console.error("Error fetching saved games:", error));
  };

  const saveGame = () => {
    if (!gameName.trim()) {
      alert("Please enter a game name");
      return;
    }

    axios.post("http://150.95.111.7:5000/save-game", {
      name: gameName,
      board_state: JSON.stringify(board),
      current_turn: currentTurn,
      difficulty_rating: difficultyRating
    })
    .then(response => {
      alert("Game saved successfully!");
      fetchSavedGames(); // Refresh the games list
    })
    .catch(error => {
      console.error("Error saving game:", error);
      if (error.response && error.response.data) {
        alert(error.response.data.error || "Failed to save game");
      } else {
        alert("Failed to save game");
      }
    });
  };

  const deleteGame = (gameId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ván cờ này?")) {
      return;
    }
  
    axios.delete(`http://150.95.111.7:5000/game/${gameId}`)
      .then(response => {
        alert("Ván cờ đã được xóa thành công!");
        fetchSavedGames(); // Cập nhật danh sách game sau khi xóa
      })
      .catch(error => {
        console.error("Lỗi khi xóa ván cờ:", error);
        if (error.response && error.response.data) {
          alert(error.response.data.error || "Không thể xóa ván cờ");
        } else {
          alert("Không thể xóa ván cờ");
        }
      });
  };
  

  const loadGame = (id) => {
    axios.get(`http://150.95.111.7:5000/game/${id}`)
      .then(response => {
        setBoard(JSON.parse(response.data.board_state));
        setCurrentTurn(response.data.current_turn);
        setDifficultyRating(response.data.difficulty_rating);
        setSelected(null);
        setValidMoves([]);
        setHighlightedTargets([]);
        setWinner(null);
        setCheckMessage(null);
      })
      .catch(error => console.error("Error loading game:", error));
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
          setWinner("You wins!");
        } else if (capturedPiece === "帅") {
          setWinner("You Loss!");
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
    setCurrentTurn("black");
    // Không reset difficulty rating khi bắt đầu trò chơi mới
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
                    <a href="/chess-offline" className="block p-3 hover:bg-gray-200"><img src="images/play-computer-sm.svg" alt="nguoi may"></img> {language === "en" ? "Play vs Computer" : "Chơi với máy"}</a>
                    <a href="/chess-online" className="block p-3 hover:bg-gray-200"><img src="images/challenge-friends.svg" alt="2 nguoi choi"></img>{language === "en" ? "Play Online" : "Chơi trực tuyến"}</a>
                    <a href="/option3" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 3" : "Tùy chỉnh 3"}</a>
                    <a href="/option4" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 4" : "Tùy chỉnh 4"}</a>
                  </div>
                )}
    
    
          {/*//////////////////////////// Main Content//////////////////////////////////////////////////////////////// */}
          <main className="flex-1 flex flex-col items-center justify-center ">
            <div className="relative">
                {/* <img src="./images/7ae13dc846895f17189251218266e987.jpg" alt="" className="w-screen h-screen object-cover">
                </img> */}
                <img src="./images/sonha.svg" alt="" className="w-screen h-screen object-cover">
                </img>
            </div>
            <div className="flex flex-col items-center absolute ">
            {/* <h1 className="text-2xl font-bold mb-6">Cờ Tướng</h1> */}
            <div className="flex">
                <div className=" flex flex-col justify-center items-center ">
                {/* Game controls */}
                <div className=" flex gap-4 items-center">
                    <input 
                    type="text" 
                    placeholder="Enter game name" 
                    value={gameName} 
                    onChange={e => setGameName(e.target.value)} 
                    className="px-3 py-2 border rounded-md"
                    />
                    
                    {/* Difficulty Rating selection */}
                    <div className="flex items-center">
                    <span className="mr-2">Độ khó:</span>
                    <div className="flex">
                        {renderStars(difficultyRating)}
                    </div>
                    <span className="ml-2">{difficultyRating}/10</span>
                    </div>
                    <div className="flex flex-col">
                        <button 
                        onClick={saveGame} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                        Save Game
                        </button>
                        <button 
                        onClick={restartGame} 
                        className="px-4 py-2 mt-4 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                        New Game
                        </button>
                    </div>
                </div>
                
                {/* Current turn indicator */}
                <div className="mb-4 text-lg font-semibold">
                    Current Turn: {currentTurn === "black" ? "Black" : "Red"}
                </div>
                
                {/* Board container with background */}
                <div
                    className="grid items-center grid-cols-9 w-[483px] h-[547px] border-2 border-gray-700 relative rounded-lg"
                    style={{
                    backgroundImage: "url('/images/board.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    }}
                >
                    {/* Board */}
                    <div className="grid  grid-cols-9 w-[483px] h-[547px] border-2 border-gray-700 relative rounded-lg">
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
                            `}
                            >
                            {validMoves.some(([r, c]) => r === rowIndex && c === colIndex) && (
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

                <div>
                {/* Saved games list */}
                {savedGames.length > 0 && (
                    <div className="ml-8 w-[650px]">
                    <h2  className="text-xl font-bold mb-2">Saved Games</h2>
                    <div className="max-h-[690px] overflow-y-auto border border-gray-300 rounded-md"
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
                                className="hover:bg-gray-400 cursor-pointer border-t border-gray-200"
                                onClick={() => loadGame(game.id)}
                            >
                                <td className="w-[20px] max-w-[20px] break-words whitespace-pre-wrap p-2">{game.name}</td>
                                <td className="p-2 text-center">
                                <div className="flex justify-center">
                                    <span className="text-yellow-500">
                                        <div className="flex">
                                            {renderStars(game.difficulty_rating)}
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
                                <td>
                                <button
                                    onClick={() => deleteGame(game.id)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md"
                                >
                                    Xóa
                                </button>
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