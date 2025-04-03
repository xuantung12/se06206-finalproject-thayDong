import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Clapperboard } from "lucide-react"; // Import biểu tượng từ lucide-react


const API_URL = "http://150.95.111.7:5000/uploads"; // API lưu nội dung tải lên


function CourseDetail() {
  const location = useLocation();
  const course = location.state?.course;


  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [uploads, setUploads] = useState([]);
  const [editNote, setEditNote] = useState({ id: null, text: "" });


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


  return (
    <div className="min-h-screen p-6 bg-cover bg-center" style={{ backgroundImage: "url('/images/backgroud.jpg')" }}>
      <div className="max-w-4xl mx-auto mt-16">
        <h1 className="text-3xl font-bold text-center mb-6">{course?.name}</h1>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">


          {/* Ảnh bên trái */}
          <div className="flex flex-col items-center gap-4 md:w-1/3">
            <img
              src={`http://150.95.111.7:5000/uploads/${course?.image1}`}
              alt="Ảnh 1"
              className="w-full object-cover rounded-lg shadow-md"
            />
            <img
              src={`http://150.95.111.7:5000/uploads/${course?.image2}`}
              alt="Ảnh 2"
              className="w-full object-cover rounded-lg shadow-md"
            />
          </div>


          {/* Nội dung bên phải */}
          <div className="flex-1">
            <p className="text-gray-700 mb-4">{course?.description}</p>


            {/* Form Upload */}
            <form onSubmit={handleUpload} className="bg-orange-100 p-4 mt-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-2">Upload Video / Ảnh & Ghi chú</h2>


              <label className="flex items-center gap-2 border p-2 w-full mb-2 cursor-pointer hover:bg-gray-200 transition-all rounded-lg">
                <Clapperboard className="w-6 h-6 text-gray-500" />
                <span className="text-lg">
                  {file ? file.name : "Chưa có video"}
                </span>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} required />
              </label>


              <textarea
                className="border p-2 w-full mb-2 text-lg"
                placeholder="Nhập ghi chú..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />


              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full text-lg hover:bg-blue-600 transition-all">
                Tải lên
              </button>
            </form>


            {/* Hiển thị video/ảnh đã tải lên */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Nội dung đã tải lên</h2>
              <div className="flex flex-col gap-4 ">
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
                            className="border p-1 w-full text-lg"
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleEdit(upload.id)} className="bg-green-500 text-white px-2 py-1 rounded text-lg hover:bg-green-600 transition-all">
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditNote({ id: null, text: "" })}
                              className="bg-gray-500 text-white px-2 py-1 rounded text-lg hover:bg-gray-600 transition-all"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-lg mb-2">{upload.note}</p>
                      )}


                      <div className="flex gap-2 text-lg">
                        <button onClick={() => setEditNote({ id: upload.id, text: upload.note })} className="bg-yellow-500 text-white px-2 py-1 rounded text-lg hover:bg-yellow-600 transition-all">
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(upload.id)} className="bg-red-500 text-white px-2 py-1 rounded text-lg hover:bg-red-600 transition-all">
                          Xóa
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


export default CourseDetail;