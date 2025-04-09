import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaGamepad,
  FaPuzzlePiece,
  FaBook,
  FaTv,
  FaCommentDots,
  FaSun,
  FaMoon,
  FaGlobe,
  FaSignOutAlt,
  FaSignInAlt
} from "react-icons/fa";

const socket = io("http://150.95.111.7:4000");

export default function ActiveGames() {
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);

  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(true);

 
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

    socket.emit("getActiveGames");

    // Listen for active games updates
    socket.on("activeGamesUpdate", (games) => {
      setActiveGames(games);
      setLoading(false);
    });

    return () => {
      socket.off("activeGamesUpdate");
    };

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

  const formatDuration = (startTime) => {
    const durationInSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      


      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Trận đấu đang diễn ra</h1>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Đang tải trận đấu...</p>
        </div>
      ) : activeGames.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-lg text-gray-600">Không có trận đấu nào đang diễn ra</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGames.map((game) => (
            <div
              key={game.roomId}
              className="border rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Phòng: {game.roomId}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Đang diễn ra
                </span>
              </div>
              
              <div className="flex justify-between mb-4">
                <div className="text-red-600 font-medium">Quân Đỏ</div>
                <div className="font-bold">VS</div>
                <div className="text-gray-800 font-medium">Quân Đen</div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <div>Thời gian: {formatDuration(game.startTime)}</div>
                <div>Người xem: {game.spectators}</div>
              </div>
              
              <Link
                to={`/spectate/${game.roomId}`}
                className="flex items-center justify-center w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaEye className="mr-2" />
                Xem trận đấu
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}


function MenuItem({ icon, text, isExpanded, link }) {
  return (
    <a href={link} className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
      <span className="text-xl">{icon}</span>
      {isExpanded && <span>{text}</span>}
    </a>
  );
}


function MainButton({ icon, title, subtitle, link }) {
  return (
    <a href={link} className="flex items-center space-x-4 w-full border border-orange-900 p-4 rounded-lg hover:bg-red-100">
      <div className="text-orange-900 text-xl">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-orange-900">{title}</h3>
        <p className="text-sm">{subtitle}</p>
      </div>
    </a>
  );
}
