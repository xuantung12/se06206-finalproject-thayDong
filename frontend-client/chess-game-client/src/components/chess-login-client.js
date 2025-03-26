import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";




const ChessLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
 


  // 🟢 Kiểm tra session khi tải trang
  useEffect(() => {
    const fetchSessionUser = async () => {
      try {
        const response = await fetch("http://150.95.113.55/session-user", {
          credentials: "include",
        });


        if (!response.ok) {
          console.warn(`⚠️ API lỗi: ${response.status}`);
          return;
        }


        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("❌ Không thể lấy session:", error);
      }
    };
    fetchSessionUser();
  }, []);


  // 🟢 Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // 🟢 Hiển thị/Ẩn mật khẩu
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  // 🟢 Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");


    if (!formData.email || !formData.password) {
      return setMessage("❌ Vui lòng nhập email và mật khẩu!");
    }


    setLoading(true);


    try {
      const response = await fetch("http://150.95.113.55/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sai email hoặc mật khẩu!");
      }


      const data = await response.json();
      setUser(data.user);
      setMessage("✅ Đăng nhập thành công! Đang chuyển hướng...");


      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3">
            <a href="/background-home">
              <img
                src="https://ppclink.com/wp-content/uploads/2021/11/co-tuong-online.jpg"
                alt="Logo"
                className="h-10 rounded-lg"
              />
            </a>
            <span className="text-red-700 font-semibold text-lg">CoTuong.Com</span>
          </div>
          <h1 className="text-red-700 font-semibold text-lg">Đăng Nhập</h1>
        </div>


        {/* Thông báo lỗi/thành công */}
        {message && (
          <div className={`mb-3 text-center text-sm ${message.includes("✅") ? "text-green-700" : "text-red-700"}`}>
            {message}
          </div>
        )}


        {/* Hiển thị avatar nếu đã đăng nhập */}
        {user && (
          <div className="flex flex-col items-center mb-4">
            <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-red-700" />
            <span className="mt-2 text-lg font-semibold text-gray-700">{user.username}</span>
          </div>
        )}


        {/* Form đăng nhập */}
        {!user && (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-gray-700 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
                placeholder="Nhập email"
                required
              />
            </div>


            <div className="mb-3">
              <label className="block text-gray-700 text-sm">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "🙉" : "🙈"}
                </button>
              </div>
              <div className="text-right mt-1">
                <a href="/forgot-password" className="text-sm text-red-700 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
            </div>


            <button
              type="submit"
              className="w-full bg-red-700 text-white py-2 rounded-md font-semibold hover:bg-red-800 transition"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>
          </form>
        )}


        {/* Đăng xuất nếu đã đăng nhập */}
        {user && (
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await fetch("http://150.95.113.55/logout", {
                  method: "POST",
                  credentials: "include",
                });
                setUser(null);
                setMessage("✅ Đã đăng xuất!");
              } catch (error) {
                setMessage("❌ Lỗi khi đăng xuất!");
              }
              setLoading(false);
            }}
            className="w-full mt-4 bg-gray-600 text-white py-2 rounded-md font-semibold hover:bg-gray-700 transition"
          >
            Đăng Xuất
          </button>
        )}


        {!user && (
          <div className="text-center text-sm text-gray-600 mt-4">
            Chưa có tài khoản?{" "}
            <a href="/chess-register-client" className="text-red-700 hover:underline">
              Đăng Ký
            </a>
          </div>
        )}
      </div>
    </div>
  );
};


export default ChessLogin;