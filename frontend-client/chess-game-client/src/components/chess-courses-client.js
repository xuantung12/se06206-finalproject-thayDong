import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { GraduationCap } from "lucide-react";


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








const API_URL = "http://150.95.111.7:5000/courses";




const translations = {
  en: {
    manageCourses: "All Chess Courses",
    courseName: "Course Name",
    courseDescription: "Course Description",
  },
  vi: {
    manageCourses: "Tất cả các khóa học Cờ Tướng",
    courseName: "Tên khóa học",
    courseDescription: "Mô tả khóa học",
  }
};






function ChessCourses() {
  const [courses, setCourses] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);








  useEffect(() => {
    fetchCourses();
  }, []);








  const fetchCourses = async () => {
    try {
      const response = await axios.get(API_URL);
      setCourses(response.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };




  








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
    <div
  className={`min-h-screen flex ${
    darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
  }`}
  style={{ backgroundImage: "url('/images/sonha.svg')", backgroundSize: "cover", backgroundPosition: "center" }}
>


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
                <button className="flex items-center space-x-2 w-full p-2 hover:bg-orange-900 rounded" onClick={toggleDarkMode}>
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
              className={`
                fixed top-0 z-50
                ${isExpanded ? "left-64" : "left-16"}
                bg-white text-gray-900 shadow-lg w-60 border border-gray-300
                flex flex-col h-screen overflow-y-auto
              `}
              onMouseEnter={() => setKeepOpen(true)}
              onMouseLeave={() => {
                setKeepOpen(false);
                setPlayMenuOpen(false);
                setIsExpanded(false);
              }}
            >
              <a href="/chess-offline" className="flex items-center gap-2 p-3 hover:bg-gray-200">
                <img src="images/play-computer-sm.svg" alt="" />
                {language === "en" ? "Play vs Computer" : "Chơi với máy"}
              </a>
              <a href="/chess-online" className="flex items-center gap-2 p-3 hover:bg-gray-200">
                <img src="images/challenge-friends.svg" alt="" />
                {language === "en" ? "Play Online" : "Chơi trực tuyến"}
              </a>
              <a href="/option3" className="block p-3 hover:bg-gray-200">
                {language === "en" ? "Custom 3" : "Tùy chỉnh 3"}
              </a>
              <a href="/option4" className="block p-3 hover:bg-gray-200">
                {language === "en" ? "Custom 4" : "Tùy chỉnh 4"}
              </a>
            </div>
            )}
           
            {/* Main Content */}
       
       
           
            <div className={`max-w-4xl mx-auto mt-16 p-6 mb-[10px] rounded-lg shadow-md overflow-y-auto max-h-[90vh]
                scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 transition-all duration-300 ${darkMode ? "bg-gray-800 text-white" : "bg-orange-50 text-gray-900"}`}>


        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <GraduationCap className="w-10 h-10 text-blue-500" />
        {translations[language].manageCourses}
        </h1>
        <div className="grid grid-cols-1 gap-4 mt-6">
        {courses.map((course) => (
            <div
              key={course.id}
              className={`p-4 rounded-lg shadow-md flex gap-4 text-lg transition duration-300 hover:shadow-lg ${
                darkMode ? "bg-gray-700 text-white hover:bg-orange-300" : "bg-orange-100 text-gray-900 hover:bg-orange-200"
              }`}
            >
              {/* Khu vực hình ảnh */}
              <div className="w-1/4 flex flex-col gap-2">
                <img
                  src={`http://150.95.111.7:5000/uploads/${course.image1}`}
                  alt="Ảnh 1"
                  className="w-full h-auto max-h-32 object-contain rounded-lg flex-shrink-0"
                />
                <img
                  src={`http://150.95.111.7:5000/uploads/${course.image2}`}
                  alt="Ảnh 2"
                  className="w-full h-auto max-h-32 object-contain rounded-lg flex-shrink-0"
                />
              </div>


              {/* Nội dung */}
              <div className="w-3/4">
              <h3 className={`font-bold text-lg text-gray-800 truncate ${darkMode ? " text-white" : " text-gray-900"}`}>
  <Link to="/course-detail-client" state={{ course: course }} className="hover:text-orange-600">
    {course.name}
  </Link>
</h3>


                <p className={`text-gray-900 mt-1 line-clamp-3 overflow-hidden
  ${darkMode ? "bg-gray-10 text-white" : "bg-gray-10 text-gray-900"}`}>
  {course.description}
</p>




              </div>
            </div>
          ))}
        </div>
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

export default ChessCourses;