import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Camera } from "lucide-react"; // Import icon Camera

const API_URL = "http://localhost:5000/courses";

function ChessCourses() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [editId, setEditId] = useState(null);

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

  return (
    <div className="min-h-screen p-6 bg-cover bg-center" style={{ backgroundImage: "url('/images/backgroud.jpg')" }}>
      <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg fixed top-0 left-0 w-full z-50 ">
        <div className="flex items-center">
          <img src="/images/chess-piece.png" alt="Cờ Tướng" className="w-10 h-10 mr-2" />
          <span className="text-xl font-bold">Cờ Tướng</span>
        </div>
        <ul className="flex space-x-6">
          <li><Link to="/" className="hover:text-yellow-400 transition duration-300">Trang Chủ</Link></li>
          <li><Link to="/chess-offline" className="hover:text-yellow-400 transition duration-300">Chơi với máy</Link></li>
          <li><Link to="/chess-online" className="hover:text-yellow-400 transition duration-300">Chơi Online</Link></li>
          <li><Link to="/chess-chat" className="hover:text-yellow-400 transition duration-300">Phòng Chat Cộng đồng</Link></li>
          <li><Link to="/chess-courses" className="hover:text-yellow-400 transition duration-300">Khóa Học</Link></li>
          <li><Link to="/chess-register" className="hover:text-yellow-400 transition duration-300">Đăng Kí</Link></li>
          <li><Link to="/chess-login" className="hover:text-yellow-400 transition duration-300">Đăng Nhập</Link></li>
        </ul>
      </nav>

      <div className="max-w-4xl mx-auto mt-16">
        <h1 className="text-3xl font-bold text-center mb-6 ">Quản lý Khóa học Cờ Tướng</h1>
        
        <form onSubmit={handleSubmit} className="bg-orange-100 p-4 rounded-lg shadow-md text-lg">
          <input type="text" placeholder="Tên khóa học" className="border p-2 w-full mb-2" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea placeholder="Mô tả khóa học" className="border p-2 w-full mb-2" value={description} onChange={(e) => setDescription(e.target.value)} required />
          
          <div className="relative inline-block">
            <input type="file" id="file-upload-1" className="hidden" onChange={(e) => setImage1(e.target.files[0])} />
            <label htmlFor="file-upload-1" className="cursor-pointer flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition">
              <Camera className="h-6 w-6 text-gray-700" /> 
              <span className="text-gray-700 font-medium">Thêm ảnh bìa</span>
            </label>
            <span className="text-gray-600 text-sm">{image1 ? `Đã chọn: ${image1.name}` : "Chưa có ảnh"}</span>
          </div>
          
          <div className="relative inline-block">
            <input type="file" id="file-upload-2" className="hidden" onChange={(e) => setImage2(e.target.files[0])} />
            <label htmlFor="file-upload-2" className="cursor-pointer flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-lg shadow-md hover:bg-gray-100 transition">
              <Camera className="h-6 w-6 text-gray-700" /> 
              <span className="text-gray-700 font-medium">Thêm ảnh phụ</span>
            </label>
            <span className="text-gray-600 text-sm">{image2 ? `Đã chọn: ${image2.name}` : "Chưa có ảnh"}</span>
          </div>
          
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition-all">{editId ? "Cập nhật khóa học" : "Thêm khóa học"}</button>
        </form>

        <div className="grid grid-cols-1 gap-4 mt-6">
          {courses.map((course) => (
            <div
            key={course.id}
            className="bg-orange-100 p-4 rounded-lg shadow-md flex items-center gap-4 text-lg transition duration-300 hover:shadow-lg hover:bg-orange-200"
          >
          
              <div className="flex flex-col gap-2 w-1/3">
                <img src={`http://localhost:5000/uploads/${course.image1}`} alt="Ảnh 1" className="w-full h-32 object-cover rounded-lg" />
                <img src={`http://localhost:5000/uploads/${course.image2}`} alt="Ảnh 2" className="w-full h-32 object-cover rounded-lg" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-bold text-lg">
                  <Link to="/course-detail" state={{ course: course }} className="text-blue-500 hover:underline">
                    {course.name}
                  </Link>
                </h3>
                <p className="text-lg text-gray-600 mb-2 ">{course.description}</p>
                <div className="flex gap-2">
                  
                <button onClick={() => handleEdit(course)} className="bg-green-500 text-white px-3 py-1 rounded transition duration-300 hover:bg-green-600">Sửa</button>
                <button onClick={() => handleDelete(course.id)} className="bg-red-500 text-white px-3 py-1 rounded transition duration-300 hover:bg-red-600">Xóa</button>

                </div> 
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChessCourses;
