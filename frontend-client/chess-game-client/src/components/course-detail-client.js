import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Clapperboard } from "lucide-react"; // Import biểu tượng từ lucide-react


const API_URL = "http://localhost:5000/uploads"; // API lưu nội dung tải lên


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
              src={`http://localhost:5000/uploads/${course?.image1}`}
              alt="Ảnh 1"
              className="w-full object-cover rounded-lg shadow-md"
            />
            <img
              src={`http://localhost:5000/uploads/${course?.image2}`}
              alt="Ảnh 2"
              className="w-full object-cover rounded-lg shadow-md"
            />
          </div>


          {/* Nội dung bên phải */}
          <div className="flex-1">
            <p className="text-gray-700 mb-4">{course?.description}</p>


            


            {/* Hiển thị video/ảnh đã tải lên */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Nội dung đã tải lên</h2>
              <div className="flex flex-col gap-4 ">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex flex-col md:flex-row border p-4 rounded-lg shadow-md hover:bg-orange-200">
                    <div className="w-full md:w-2/3">
                      {upload.type.includes("video") ? (
                        <video controls className="w-full h-64 object-cover rounded-lg">
                          <source src={`http://localhost:5000/uploads/${upload.file}`} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={`http://localhost:5000/uploads/${upload.file}`}
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