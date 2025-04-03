import { useState, useEffect, useRef } from "react";
import axios from "axios";


import {
  FaGamepad,
  FaPuzzlePiece,
  FaBook,
  FaCommentDots,
  FaSun,
  FaMoon,
  FaChess,
  FaGlobe,
  FaSignOutAlt,
  FaSignInAlt
} from "react-icons/fa";
import io from "socket.io-client";


const socket = io("http://150.95.111.7:3001");


const MenuItem = ({ icon, text, isExpanded, link }) => (
  <a href={link} className="flex items-center space-x-2 w-full p-2 hover:bg-orange-700 rounded">
    {icon}
    {isExpanded && <span>{text}</span>}
  </a>
);


export default function ChessChat() {
  const [darkMode, setDarkMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const [usersList, setUsersList] = useState([]); // Danh sách tài khoản đăng ký
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);




 




  useEffect(() => {
    axios.get("http://150.95.111.7:3001/users")
      .then(res => setUsersList(res.data))
      .catch(err => console.error("❌ Lỗi lấy danh sách người dùng:", err));
 
    // Lắng nghe danh sách người dùng online từ socket
    socket.on("userList", (onlineUsers) => {
      setUsersList(prevUsers => prevUsers.map(user => ({
        ...user,
        isOnline: onlineUsers.includes(user.username)
      })));
    });
 
    return () => {
      socket.off("userList");
    };
  }, []);
 


  useEffect(() => {
    axios.get("http://150.95.111.7:3001/session-user", { withCredentials: true })
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));


    axios.get("http://150.95.111.7:3001/messages")
      .then(res => setMessages(res.data));


    socket.on("newMessage", msg => {
      setMessages(prev => [...prev, msg]);
    });


    // Lấy danh sách tài khoản đăng ký
    axios.get("http://150.95.111.7:3001/users")
      .then(res => setUsersList(res.data))
      .catch(err => console.error("❌ Lỗi lấy danh sách người dùng:", err));

      setDarkMode(localStorage.getItem("darkMode") === "true");


    return () => {
      socket.off("newMessage");
    };
  }, []);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const sendMessage = () => {
    if (!input || !user) return;


    const newMessage = {
      username: user.username,
      avatar: user.avatar || "/avatars/default.png",
      message: input
    };


    axios.post("http://150.95.111.7:3001/messages", newMessage)
      .then(() => setInput(""))
      .catch(err => console.error("❌ Lỗi gửi tin nhắn:", err));
  };


  const handleLogout = () => {
    axios.post("http://150.95.111.7:3001/logout", {}, { withCredentials: true })
      .then(() => {
        setUser(null);
        window.location.reload();
      })
      .catch(err => console.error("❌ Lỗi đăng xuất:", err));
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
                <a href="/chess-offline-client" className="block p-3 hover:bg-gray-200"><img src="images/play-computer-sm.svg"></img> {language === "en" ? "Play vs Computer" : "Chơi với máy"}</a>
                    <a href="/chess-online-client" className="block p-3 hover:bg-gray-200"><img src="images/challenge-friends.svg"></img>{language === "en" ? "Play Online" : "Chơi trực tuyến"}</a>
                    <a href="/option3" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 3" : "Tùy chỉnh 3"}</a>
                    <a href="/option4" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 4" : "Tùy chỉnh 4"}</a>
              </div>
            )}


      {/* Main Chat + Danh sách tài khoản */}
      <main className="flex-1 flex items-center justify-center p-10 w-full h-screen">
      <div className="w-full max-w-5xl h-[80vh] flex gap-4">
        {/* Khung Chat */}  
        <div className="flex flex-col w-2/3 bg-white shadow-lg rounded-lg p-4 h-full">
          <h2 className="text-2xl font-bold text-orange-900 text-center">Chat Online</h2>
          <div className="flex-1 overflow-y-auto p-4 border rounded-lg">
          {messages.length === 0 ? (
      <p className="text-gray-500 text-center">Chưa có tin nhắn nào</p>
    ) : (
      messages.map((msg, i) => (
        <div key={i} className={`flex flex-col items-start mb-6 ${msg.username === user?.username ? "items-end" : "items-start"}`}>
        <div className="flex items-center">
          {msg.username !== user?.username && (
            <img src={msg.avatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
          )}
          <div className="bg-gray-200 p-2 rounded-lg relative">
            <span className="absolute -top-5 t-xs text-gray-600 font-bold font-sans text-lg">{msg.username}</span>
            {msg.message}
          </div>
          {msg.username === user?.username && (
            <img src={msg.avatar} alt="Avatar" className="w-8 h-8 rounded-full ml-2" />
          )}
        </div>
      </div>
      ))
    )}
      <div ref={chatEndRef} />
      </div>
      {/* Input chat */}
      <div className="mt-2 flex">
        <input
          type="text"
          className="flex-1 border rounded-lg p-2"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="ml-2 bg-orange-600 text-white px-4 py-2 rounded-lg" onClick={sendMessage}>
          Gửi
        </button>
      </div>
    </div>


    {/* Danh sách tài khoản */}
    <div className="w-1/3 bg-white shadow-lg rounded-lg p-4 h-full">
      <h3 className="text-lg font-bold text-orange-900 text-center">Bạn Bè</h3>
      <div className="overflow-y-auto h-[calc(100%-40px)] p-2 border rounded-lg">
        {usersList.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có tài khoản nào</p>
        ) : (
          usersList.map((u, index) => (
            <div key={index} className="flex items-center mb-2">
              <img src={u.avatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
              <span>{u.username}</span>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
</main>
    </div>
  );
}
