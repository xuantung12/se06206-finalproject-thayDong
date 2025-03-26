import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Camera } from "lucide-react";
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


const API_URL = "http://150.95.113.55:5000/courses";


const translations = {
  en: {
    manageCourses: "Chess Course Management",
    courseName: "Course Name",
    courseDescription: "Course Description",
    addCoverImage: "Add Cover Image",
    addSecondaryImage: "Add Secondary Image",
    noImage: "No image selected",
    addCourse: "Add Course",
    updateCourse: "Update Course",
    edit: "Edit",
    delete: "Delete"
  },
  vi: {
    manageCourses: "Quản lý Khóa học Cờ Tướng",
    courseName: "Tên khóa học",
    courseDescription: "Mô tả khóa học",
    addCoverImage: "Thêm ảnh bìa",
    addSecondaryImage: "Thêm ảnh phụ",
    noImage: "Chưa có ảnh",
    addCourse: "Thêm khóa học",
    updateCourse: "Cập nhật khóa học",
    edit: "Sửa",
    delete: "Xóa"
  }
};




function ChessCourses() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [editId, setEditId] = useState(null);
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


  const handleEdit = (course) => {
    setEditId(course.id);
    setName(course.name);
    setDescription(course.description);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image1) formData.append("image1", image1);
    if (image2) formData.append("image2", image2);


    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      fetchCourses();
      resetForm();
    } catch (error) {
      console.error("Lỗi gửi dữ liệu:", error);
    }
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCourses();
    } catch (error) {
      console.error("Lỗi xóa dữ liệu:", error);
    }
  };


  const resetForm = () => {
    setName("");
    setDescription("");
    setImage1(null);
    setImage2(null);
    setEditId(null);
  };


  useEffect(() => {
    // Gọi API lấy user từ session
    axios.get("http://150.95.113.55:3001/session-user", { withCredentials: true })
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
    axios.post("http://150.95.113.55:3001/logout", {}, { withCredentials: true })
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
    <div className={`flex ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`} style={{ backgroundImage: "url('/images/backgroud.jpg')" }}>
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
           
            {/* Main Content */}
            
      <div className="max-w-4xl mx-auto mt-16">
      <h1 className="text-3xl font-bold text-center mb-6">
          {translations[language].manageCourses}
        </h1>
       
        <form onSubmit={handleSubmit} className="bg-orange-100 p-4 rounded-lg shadow-md text-lg">
        <input type="text" placeholder={translations[language].courseName} className="border p-2 w-full mb-2" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder={translations[language].courseDescription} className="border p-2 w-full mb-2" value={description} onChange={(e) => setDescription(e.target.value)} required />
         
          <div className="relative inline-block">
          <label htmlFor="file-upload-1" className="cursor-pointer flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition">
            <Camera className="h-6 w-6 text-gray-700" />
            <span className="text-gray-700 font-medium">{translations[language].addCoverImage}</span>
          </label>
          <input
            id="file-upload-1"
            type="file"
            className="hidden"
            onChange={(e) => setImage1(e.target.files[0])}
          />
          <span className="text-gray-600 text-sm">{image1 ? `Đã chọn: ${image1.name}` : translations[language].noImage}</span>
          </div>


         
          <div className="relative inline-block">
            <label htmlFor="file-upload-2" className="cursor-pointer flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition">
              <Camera className="h-6 w-6 text-gray-700" />
              <span className="text-gray-700 font-medium">{translations[language].addSecondaryImage}</span>
            </label>
            <input
              id="file-upload-2"
              type="file"
              className="hidden"
              onChange={(e) => setImage2(e.target.files[0])}
            />
            <span className="text-gray-600 text-sm">{image2 ? `Đã chọn: ${image2.name}` : translations[language].noImage}</span>
          </div>


         
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition-all">
            {editId ? translations[language].updateCourse : translations[language].addCourse}
          </button>
        </form>


        <div className="grid grid-cols-1 gap-4 mt-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-orange-100 p-4 rounded-lg shadow-md flex items-center gap-4 text-lg transition duration-300 hover:shadow-lg hover:bg-orange-200">
         
              <div className="flex flex-col gap-2 w-1/3">
                <img src={`http://150.95.113.55:5000/uploads/${course.image1}`} alt="Ảnh 1" className="w-full h-32 object-cover rounded-lg" />
                <img src={`http://150.95.113.55:5000/uploads/${course.image2}`} alt="Ảnh 2" className="w-full h-32 object-cover rounded-lg" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-lg">
                  <Link to="/course-detail" state={{ course: course }} className="text-blue-500 hover:underline">
                    {course.name}
                  </Link>
                </h3>
                <p className="text-lg text-gray-600 mb-2 ">{course.description}</p>
                <div className="flex gap-2">
                 
                <button onClick={() => handleEdit(course)} className="bg-green-500 text-white px-3 py-1 rounded transition duration-300 hover:bg-green-600">{translations[language].edit}</button>
                  <button onClick={() => handleDelete(course.id)} className="bg-red-500 text-white px-3 py-1 rounded transition duration-300 hover:bg-red-600">{translations[language].delete}</button>


                </div>
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


export default ChessCourses;