import { useState, useEffect } from "react";
import axios from "axios";
import {
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


export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);


 
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
          <a href="/chess-offline-client" className="block p-3 hover:bg-gray-200"><img src="images/play-computer-sm.svg" alt=""></img> {language === "en" ? "Play vs Computer" : "Chơi với máy"}</a>
              <a href="/chess-online-client" className="block p-3 hover:bg-gray-200"><img src="images/challenge-friends.svg" alt=""></img>{language === "en" ? "Play Online" : "Chơi trực tuyến"}</a>
              <a href="/option3" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 3" : "Tùy chỉnh 3"}</a>
              <a href="/option4" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 4" : "Tùy chỉnh 4"}</a>
        </div>
      )}


      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <div className=" w-[100%] h-auto absolute bottom-0 left-0 size-16 pointer-events-none">
          <img src="images/96857e5411a903ed226e3c87e54cc29c (1).svg" alt="Ảnh mẫu"
          class="w-[100%] h-auto"></img>
        </div>
        <div className=" w-[100%] h-auto absolute bottom-0 left-0 size-16 pointer-events-none">
          <img src="/images/sonha.svg" alt="Ảnh mẫu"
          class="w-[100%] h-auto"></img>
        </div>
        <h2 className="text-3xl font-bold mb-5">
          <a href="/" className="text-orange-900 hover:underline">{language === "en" ? "Welcome to CoTuong.com!" : "Chào mừng đến với CoTuong.com!"}</a>
        </h2>
        <div className="space-y-4 w-96">
          <MainButton icon={<FaGamepad />} title={language === "en" ? "Play Online" : "Chơi Online"} subtitle={language === "en" ? "Challenge Players Worldwide" : "Thách đấu người chơi toàn cầu"} link="/chess-online-client" />
          <MainButton icon={<FaTv />} title={language === "en" ? "Play Computer" : "Chơi với máy"} subtitle={language === "en" ? "Test Your Skills Against AI" : "Thử thách với AI"} link="/chess-offline-client" />
          <MainButton icon={<FaPuzzlePiece />} title={language === "en" ? "Solve Puzzles" : "Giải đố"} subtitle={language === "en" ? "Solve Brain-Teasing Puzzles" : "Giải câu đố thử thách"} link="/chess-puzzle-client" />
          <MainButton icon={<FaBook />} title={language === "en" ? "Lessons" : "Khóa học"} subtitle={language === "en" ? "Learn How to Play" : "Học cách chơi Cờ Tướng"} link="/chess-courses-client" />
          <MainButton icon={<FaTv />} title={language === "en" ? "Watch Games" : "Xem Trận Đấu"} subtitle={language === "en" ? "Learn from Other Players" : "Học từ người chơi khác"} link="/ActiveGames" />
        </div>
      </main>
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
