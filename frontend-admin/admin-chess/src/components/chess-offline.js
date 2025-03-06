import { useState } from "react";
import { FaGamepad, FaPuzzlePiece, FaBook, FaCommentDots, FaSun, FaMoon, FaGlobe, FaSignInAlt } from "react-icons/fa";


export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [language, setLanguage] = useState("en"); // Trạng thái ngôn ngữ


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
          <MenuItem icon={<FaGamepad />} text={language === "en" ? "Play Now" : "Chơi Ngay"} isExpanded={isExpanded} link="home-page" />
          </div>
          <MenuItem icon={<FaPuzzlePiece />} text={language === "en" ? "Puzzles" : "Câu đố"} isExpanded={isExpanded} link="/chess-courses" />
          <MenuItem icon={<FaBook />} text={language === "en" ? "Course" : "Khóa Học"} isExpanded={isExpanded} link="/chess-courses" />
          <MenuItem icon={<FaCommentDots />} text={language === "en" ? "Chat" : "Trò chuyện"} isExpanded={isExpanded} link="/chess-chat" />
        </nav>


        {/* Other Options */}
        <div className="mt-auto space-y-3 w-full mb-5">
          <button
            className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded"
            onClick={() => setLanguage(language === "en" ? "vi" : "en")}
          >
            <FaGlobe />
            {isExpanded && <span>{language === "en" ? "English" : "Tiếng Việt"}</span>}
          </button>
          <button
            className="flex items-center space-x-2 w-full p-2 hover:bg-orange-900 rounded"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {isExpanded && <span>{darkMode ? (language === "en" ? "Light Mode" : "Chế độ sáng") : (language === "en" ? "Dark Mode" : "Chế độ tối")}</span>}
          </button>
          <MenuItem icon={<FaSignInAlt />} text={language === "en" ? "Sign In" : "Đăng nhập"} isExpanded={isExpanded} link="/chess-login" />
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
          <a href="/chess-offline" className="block p-3 hover:bg-gray-200">{language === "en" ? "Play vs Computer" : "Chơi với máy"}</a>
          <a href="/chess-online" className="block p-3 hover:bg-gray-200">{language === "en" ? "Play Online" : "Chơi Online"}</a>
          <a href="/option3" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 3" : "Tùy chỉnh 3"}</a>
          <a href="/option4" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 4" : "Tùy chỉnh 4"}</a>
        </div>
      )}


      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <div>
        <h1 className="text-center text-2xl font-serif " >{language === "en"? "You are playing with Computer":"Bạn đang chơi với máy"}</h1>
        <iframe src="/static/index.html" width="800px" height="630px" title="Chess Game"></iframe>
      </div>
      </main>
    </div>
  );
}


// Component cho menu item trong sidebar
function MenuItem({ icon, text, isExpanded, link, onClick }) {
  return (
    <a href={link} onClick={onClick} className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
      <span className="text-xl">{icon}</span>
      {isExpanded && <span>{text}</span>}
    </a>
  );
}