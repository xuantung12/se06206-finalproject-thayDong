import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Đảm bảo import Link
import axios from "axios";

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
    <div className="container mx-auto p-6">
      {/* Thanh Navigation */}
        <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg fixed top-0 left-0 w-full z-50">
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

      <div className="mt-16">
        {/* Nội dung trang */}
      </div>

      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold text-center mb-4">Quản lý Khóa học Cờ Tướng</h1>

      {/* Form thêm/sửa khóa học */}
      <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-lg shadow-md">
        <div className="mb-2">
          <label className="block font-semibold">Tên khóa học:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-2">
          <label className="block font-semibold">Mô tả:</label>
          <textarea
            className="border p-2 w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-2">
          <label className="block font-semibold">Ảnh 1:</label>
          <input type="file" onChange={(e) => setImage1(e.target.files[0])} />
        </div>

        <div className="mb-2">
          <label className="block font-semibold">Ảnh 2:</label>
          <input type="file" onChange={(e) => setImage2(e.target.files[0])} />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          {editId ? "Cập nhật khóa học" : "Thêm khóa học"}
        </button>
      </form>

      {/* Danh sách khóa học */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Danh sách khóa học</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((course) => (
  <div key={course.id} className="border p-4 rounded-lg shadow-md">
    <h3 className="font-bold">
    <Link 
  to="/course-detail" 
  state={{ course: course }} // Truyền dữ liệu khóa học
  className="text-blue-500 hover:underline"
>
  {course.name}
</Link>

    </h3>
    <p className="text-sm">{course.description}</p>
    <div className="flex gap-2 mt-2">
      <img src={`http://localhost:5000/uploads/${course.image1}`} alt="Ảnh 1" className="w-20 h-20 object-cover" />
      <img src={`http://localhost:5000/uploads/${course.image2}`} alt="Ảnh 2" className="w-20 h-20 object-cover" />
    </div>
    <div className="mt-2 flex gap-2">
      <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleEdit(course)}>
        Sửa
      </button>
      <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDelete(course.id)}>
        Xóa
      </button>
    </div>
  </div>
))}

          
        </div>
      </div>
    </div>
  );
}

export default ChessCourses;
