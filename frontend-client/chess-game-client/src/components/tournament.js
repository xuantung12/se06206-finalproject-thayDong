/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { FaGamepad, FaPuzzlePiece, FaBook, FaCommentDots, FaSun, FaMoon, FaGlobe, FaSignInAlt } from "react-icons/fa";

const socket = io("http://localhost:4000");

// Component MenuItem
const MenuItem = ({ icon, text, isExpanded, link }) => {
  return (
    <a href={link} className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
      {icon}
      {isExpanded && <span>{text}</span>}
    </a>
  );
};
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

const playersData = [
  { id: 1, name: " 1", avatar: "https://via.placeholder.com/50" },
  { id: 2, name: " 2", avatar: "https://via.placeholder.com/50" },
  { id: 3, name: " 3", avatar: "https://via.placeholder.com/50" },
  { id: 4, name: " 4", avatar: "https://via.placeholder.com/50" },
  { id: 5, name: " 5", avatar: "https://via.placeholder.com/50" },
  { id: 6, name: "6", avatar: "https://via.placeholder.com/50" },
  { id: 7, name: " 7", avatar: "https://via.placeholder.com/50" },
  { id: 8, name: " 8", avatar: "https://via.placeholder.com/50" },
];

const Tournament = () => {
  const [players, setPlayers] = useState([ { name: "Player 1" }, { name: "Player 2" },
    { name: "Player 3" }, { name: "Player 4" },
    { name: "Player 5" }, { name: "Player 6" },
    { name: "Player 7" }, { name: "Player 8" }]);
    const [rounds, setRounds] = useState([players, [], [], []]);
  // Missing state variables
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    socket.on("playerJoined", ({ players }) => {
      setPlayers(players);
    });
    return () => socket.off("playerJoined");
  }, []);
  const handleWin = (winner, round) => {
    if (round < 3) {
      const newRounds = [...rounds];
      newRounds[round].push(winner);
      setRounds(newRounds);
    } else {
      setRounds((prevRounds) => {
        const newRounds = [...prevRounds];
        newRounds[3] = [winner]; // Nhà vô địch
        return newRounds;
      });
    }
  };

  const PlayerCard = ({ player, opponent, onWin }) => {
    if (!player || !opponent) return <div className="p-4 text-gray-400">Chờ đối thủ...</div>;

    return (
      <div className="flex items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md w-80">
        {/* Người chơi 1 */}
        <div className="text-white flex flex-col items-center">
          <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full" />
          <p className="mt-2">{player.name}</p>
        </div>

        {/* VS */}
        <p className="text-yellow-400 text-lg font-bold">VS</p>

        {/* Người chơi 2 */}
        <div className="text-white flex flex-col items-center">
          <img src={opponent.avatar} alt={opponent.name} className="w-12 h-12 rounded-full" />
          <p className="mt-2">{opponent.name}</p>
        </div>

        {/* Nút chọn người thắng */}
        <div className="flex flex-col ml-4">
          <button className="bg-blue-500 text-white px-3 py-1 rounded-md mb-1" onClick={() => onWin(player)}>Thắng</button>
          <button className="bg-red-500 text-white px-3 py-1 rounded-md" onClick={() => onWin(opponent)}>Thua</button>
        </div>
      </div>
    );
};

  return (
   <div className="bg-gray-900 p-4 text-white">
    {/* 🌟 Sidebar Navigation */}
    <div className={`flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
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
        <a href="/" className="flex items-center space-x-3 mt-5 mb-5">
          <img src="/images/chess-piece.png" alt="Logo Cờ Tướng" className="w-12 h-12" />
          {isExpanded && <span className="text-2xl font-bold">CoTuong.com</span>}
        </a>

        {/* 🏆 Navigation */}
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
          <MenuItem icon={<FaPuzzlePiece />} text={language === "en" ? "Puzzles" : "Câu đố"} isExpanded={isExpanded} link="/chess-courses" />
          <MenuItem icon={<FaBook />} text={language === "en" ? "Course" : "Khóa Học"} isExpanded={isExpanded} link="/chess-courses" />
          <MenuItem icon={<FaCommentDots />} text={language === "en" ? "Chat" : "Trò chuyện"} isExpanded={isExpanded} link="/chess-chat" />
        </nav>

        {/* 🌎 Options */}
        <div className="  mt-32 space-y-3 w-full mb-5">
          <button
            className=" flex items-center space-x-2 w-full p-2  hover:bg-orange-700 rounded"
            onClick={() => setLanguage(language === "en" ? "vi" : "en")}
          >
            <FaGlobe />
            {isExpanded && <span>{language === "en" ? "English" : "Tiếng Việt"}</span>}
          </button>
          <button
            className=" flex items-center space-x-2 w-full p-2 hover:bg-orange-900 rounded"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {isExpanded && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <MenuItem icon={<FaSignInAlt />} text="Sign In" isExpanded={isExpanded} link="/chess-login" />
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
          <a href="/chess-offline" className="block p-3 hover:bg-gray-200">
            {language === "en" ? "Play vs Computer" : "Chơi với máy"}
          </a>
          <a href="/chess-online" className="block p-3 hover:bg-gray-200">
            <img src="images/challenge-friends.svg" alt="Challenge Friends Icon" />
            {language === "en" ? "Play Online" : "Chơi trực tuyến"}
          </a>
          <a href="/tournament" className="block p-3 hover:bg-gray-200">{language === "en" ? "Chess Management" : "Tham gia giải đấu"}</a>
        </div>
      )}

      {/* 🏆 Tournament Bracket */}
      <div className="  h-full flex flex-col items-center justify-center ">
        <div className="p-20 bg-pink-200  justify-center">
          <h2 className="text-center text-yellow-600 text-2xl font-bold mb-4 mt-[-70px] ">🏆 Tournament Bracket</h2>
          <div className="grid grid-cols-3 gap-6 justify-items-center">
          {/* Vòng 1 (Tứ kết) */}
          <div className="flex flex-col space-y-5 ">
            {rounds[0].map((player, index) =>
              index % 2 === 0 ? (
                <PlayerCard
                  key={index}
                  player={player}
                  opponent={rounds[0][index + 1]}
                  onWin={(winner) => handleWin(winner, 1)}
                />
              ) : null
            )}
          </div>

          {/* Vòng 2 (Bán kết) */}
          <div className="flex flex-col space-y-20 mb-4 mt-[80px]">
            {rounds[1].map((winner, index) =>
              index % 2 === 0 ? (
                <PlayerCard
                  key={index}
                  player={winner}
                  opponent={rounds[1][index + 1]}
                  onWin={(winner) => handleWin(winner, 2)}
                />
              ) : null
            )}
          </div>

          {/* Vòng 3 (Chung kết) */}
          <div className="flex flex-col space-y-10 mb-5 mt-[40px] ">
            {rounds[2][0] && rounds[2][1] ? (
              <PlayerCard
                player={rounds[2][0]}
                opponent={rounds[2][1]}
                onWin={(winner) => handleWin(winner, 3)}
                isFinal={true}
              />
            ) : (
              <div className="p-4 text-red-700 text-center ">Đợi trận chung kết...</div>
            )}
          </div>
        </div>

  {/* Nhà vô địch bên phải */}
  {rounds[3].length === 1 && (
    <div className="bg-yellow-300 p-6 mt-[-150px] rounded-lg shadow-md border border-yellow-500 text-center w-48 ml-auto">
      <h3 className="text-yellow-800 font-bold">🏆 Nhà vô địch 🏆</h3>
      <p className="text-lg font-semibold">{rounds[3][0].name}</p>
    </div>
    )}
      </div>
    </div>
    </div>
    </div>
  );
};

// ✅ **Ensure that `export default Tournament;` is placed outside the component function**
export default Tournament;