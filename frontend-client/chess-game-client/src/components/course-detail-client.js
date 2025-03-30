import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
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






const translations = {
  en: {
    manageCourses: "Chess Course Management",
    courseName: "Course Name",
    uploadedContent: "Uploaded Content",
   
  },
  vi: {
    manageCourses: "Quản lý Khóa học Cờ Tướng",
    courseName: "Tên khóa học",
    uploadedContent: "Nội dung đã tải lên",
 
  }
};








function CourseDetail() {
  const location = useLocation();
  const course = location.state?.course;



  const [uploads, setUploads] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);







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




  return (
    <div
  className={`min-h-screen flex ${
    darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
  }`}
  style={{ backgroundImage: "url('/images/sonha.svg')", backgroundSize: "cover", backgroundPosition: "center" }}
>


      <div className="max-w-4xl mx-auto mt-16">
        <h1 className="text-3xl font-bold text-center mb-6">{course?.name}</h1>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">


{/* Sidebar */}
            <aside
              className={`fixed top-0 left-0 h-screen bg-orange-900 text-white flex flex-col items-center transition-all duration-300 ${
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


          {/* Main content */}
         
          {/* Container bên phải chứa nội dung và uploaded content */}
          <div className={`max-w-4xl flex-1 mx-auto p-6 rounded-lg shadow-md overflow-y-auto max-h-[90vh]
                scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 transition-all duration-300
                      ${darkMode ? "bg-gray-800 text-white" : "bg-orange-50 text-gray-900"}
                      flex flex-col gap-6`}>


           
            <div className="flex flex-col md:flex-row  items-start gap-6">
              {/* Hình ảnh bên trái */}


                      <div className="w-1/4 flex flex-col gap-2">
                        <img
                          src={`http://localhost:5000/uploads/${course?.image1}`}
                          alt="Ảnh 1"
                          className="w-full h-auto max-h-62 object-contain rounded-lg flex-shrink-0"
                        />
                        <img
                          src={`http://localhost:5000/uploads/${course?.image2}`}
                          alt="Ảnh 2"
                          className="w-full h-auto max-h-62 object-contain rounded-lg flex-shrink-0"
                        />
                      </div>


              {/* Nội dung chữ bên phải */}
              <div className={`w-full md:w-2/3 p-4 whitespace-normal break-words max-w-screen-md rounded-lg ${darkMode ? "bg-white text-gray-100" : "bg-gray-300 text-white"}`}>




                {/* Nội dung chính */}
                        <p className="text-gray-900">{translations[language].courseDescription}: {course?.description}</p>
              </div>
            </div>
           


            {/* Uploaded Content - Đưa xuống phía dưới nội dung chính */}
              <div className="mt-6 w-full">
                <h2 className="text-xl font-semibold mb-2">{translations[language].uploadedContent}</h2>
                <div className="flex flex-col gap-4">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="flex flex-col md:flex-row border p-4 rounded-lg shadow-md  hover:bg-orange-200">
                      <div className="w-full">
                        {upload.type.includes("video") ? (
                          <video controls className="w-full h-64 object-contain rounded-lg ">
                            <source src={`http://localhost:5000/uploads/${upload.file}`} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            src={`http://localhost:5000/uploads/${upload.file}`}
                            alt="Upload"
                            className="w-full object-cover rounded-lg cursor-pointer"
                            onClick={() => setSelectedImage(`http://localhost:5000/uploads/${upload.file}`)}
                          />
                        )}
                        {/* Đưa đoạn văn bản ra ngoài điều kiện */}
                        <p className="text-lg mb-2 break-words overflow-hidden">{upload.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           
            {/* Modal hiển thị ảnh khi click */}
            {selectedImage && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
                <div className="relative p-4">
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-white text-black p-2 rounded-full shadow-lg"
                  >
                    ✖
                  </button>
                  <img src={selectedImage} alt="Enlarged" className="max-w-screen-lg max-h-screen-md rounded-lg" />
                </div>
              </div>
            )}
             
          </div>




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






export default CourseDetail;