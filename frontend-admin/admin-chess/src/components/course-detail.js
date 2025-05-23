import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Clapperboard } from "lucide-react"; // Import biểu tượng từ lucide-react
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




const API_URL = "http://150.95.111.7:5000/uploads"; // API lưu nội dung tải lên


const translations = {
  en: {
    manageCourses: "Chess Course Management",
    courseName: "Course Name",
    uploadSectionTitle: "Upload Video / Image & Notes",
    noVideo: "No video selected",
    enterNote: "Enter notes...",
    uploadButton: "Upload",
    uploadedContent: "Uploaded Content",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
  },
  vi: {
    manageCourses: "Quản lý Khóa học Cờ Tướng",
    courseName: "Tên khóa học",
    uploadSectionTitle: "Tải lên Video / Ảnh & Ghi chú",
    noVideo: "Chưa có video",
    enterNote: "Nhập ghi chú...",
    uploadButton: "Tải lên",
    uploadedContent: "Nội dung đã tải lên",
    save: "Lưu",
    cancel: "Hủy",
    edit: "Sửa",
    delete: "Xóa",
  }
};




function CourseDetail() {
  const location = useLocation();
  const course = location.state?.course;




  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [uploads, setUploads] = useState([]);
  const [editNote, setEditNote] = useState({ id: null, text: "" });
  const [isExpanded, setIsExpanded] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [playMenuOpen, setPlayMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);




  useEffect(() => {
    if (course) {
      fetchUploads();
    }
  }, [course]);




  const fetchUploads = async () => {
    try {
      const response = await axios.get(`${API_URL}?courseId=${course.id}`);
      setUploads(response.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };




  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("courseId", course.id);
    if (file) formData.append("file", file);
    formData.append("note", note);




    try {
      await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchUploads();
      setFile(null);
      setNote("");
    } catch (error) {
      console.error("Lỗi tải lên:", error);
    }
  };




  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchUploads();
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };




  const handleEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { note: editNote.text });
      setEditNote({ id: null, text: "" });
      fetchUploads();
    } catch (error) {
      console.error("Lỗi chỉnh sửa:", error);
    }
  };




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
      <div className="max-w-4xl mx-auto mt-16">
        <h1 className="text-3xl font-bold text-center mb-6">{course?.name}</h1>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">


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
                        <a href="/chess-offline" className="block p-3 hover:bg-gray-200"><img src="images/play-computer-sm.svg"></img> {language === "en" ? "Play vs Computer" : "Chơi với máy"}</a>
                            <a href="/chess-online" className="block p-3 hover:bg-gray-200"><img src="images/challenge-friends.svg"></img>{language === "en" ? "Play Online" : "Chơi trực tuyến"}</a>
                            <a href="/option3" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 3" : "Tùy chỉnh 3"}</a>
                            <a href="/option4" className="block p-3 hover:bg-gray-200">{language === "en" ? "Custom 4" : "Tùy chỉnh 4"}</a>
                      </div>
                    )}




          {/* Main content */}
         
          {/* Container bên phải chứa nội dung và uploaded content */}
          <div className={`max-w-4xl flex-1 mx-auto p-6 rounded-lg shadow-md overflow-y-auto max-h-[90vh]
                scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 transition-all duration-300
                      ${darkMode ? "bg-gray-800 text-white" : "bg-orange-50 text-gray-900"}
                      flex flex-col gap-6`}>


           
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Hình ảnh bên trái */}


                      <div className="md:w-1/3 w-1/4 flex flex-col gap-2">
                        <img
                          src={`http://150.95.111.7:5000/uploads/${course?.image1}`}
                          alt="Ảnh 1"
                          className="w-full h-auto max-h-62 object-contain rounded-lg flex-shrink-0"
                        />
                        <img
                          src={`http://150.95.111.7:5000/uploads/${course?.image2}`}
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
           


            {/* Form Upload */}
            <form onSubmit={handleUpload} className="p-4 mt-6 rounded-lg shadow-md">
            <h2 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-600"}`}>
            {translations[language].uploadSectionTitle}
            </h2>




              <label className="flex items-center gap-2 border p-2 w-full mb-2 cursor-pointer hover:bg-gray-200 transition-all rounded-lg">
                <Clapperboard className={`w-6 h-6 text-gray-500 ${darkMode ? "text-gray-400" : "text-gray-600"}`}/>
                <span className="text-lg">{file ? file.name : translations[language].noVideo}</span>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} required />
              </label>


              <textarea
                className="border p-2 w-full mb-2 text-lg"
                placeholder={translations[language].enterNote}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />


              <button type="submit" className={`bg-blue-500 text-white px-4 py-2 rounded-lg w-full text-lg hover:bg-blue-600 transition-all ${darkMode ? "bg-blue-700 text-white hover:bg-blue-600" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
                {translations[language].uploadButton}
              </button>
            </form>


            {/* Uploaded Content - Đưa xuống phía dưới nội dung chính */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">{translations[language].uploadedContent}</h2>
              <div className="flex flex-col gap-4">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex flex-col md:flex-row border p-4 rounded-lg shadow-md hover:bg-orange-200">
                    <div className="w-full md:w-2/3">
                      {upload.type.includes("video") ? (
                        <video controls className="w-full h-64 object-cover rounded-lg">
                          <source src={`http://150.95.111.7:5000/uploads/${upload.file}`} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={`http://150.95.111.7:5000/uploads/${upload.file}`}
                          alt="Upload"
                          className="w-full object-cover rounded-lg"
                        />
                      )}
                    </div>


                    <div className="w-full md:w-1/3 pl-4 flex flex-col justify-between text-lg">
                    {editNote.id === upload.id ? (
                      <div>
                        <input
                          type="text"
                          value={editNote.text}
                          onChange={(e) => setEditNote({ ...editNote, text: e.target.value })}
                          className="border p-1 w-full text-lg text-black"
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleEdit(upload.id)} className="bg-green-500 text-white px-2 py-1 rounded text-lg hover:bg-green-600 transition-all">
                            {translations[language].save}
                          </button>
                          <button
                            onClick={() => setEditNote({ id: null, text: "" })}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-lg hover:bg-gray-600 transition-all"
                          >
                            {translations[language].cancel}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Thêm class truncate và overflow-hidden để chữ không bị tràn
                      <p className="text-lg mb-2 break-words overflow-hidden">{upload.note}</p>
                    )}


                    <div className="flex gap-2 text-lg">
                      <button onClick={() => setEditNote({ id: upload.id, text: upload.note })} className="bg-yellow-500 text-white px-2 py-1 rounded text-lg hover:bg-yellow-600 transition-all">
                        {translations[language].edit}
                      </button>
                      <button onClick={() => handleDelete(upload.id)} className="bg-red-500 text-white px-2 py-1 rounded text-lg hover:bg-red-600 transition-all">
                        {translations[language].delete}
                      </button>
                    </div>
                  </div>




                </div>
                ))}
              </div>
            </div>
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


export default CourseDetail;
