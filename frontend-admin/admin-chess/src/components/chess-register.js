import React, { useState } from "react";


const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  // Xử lý thay đổi input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");


    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Mật khẩu nhập lại không khớp!");
      return;
    }


    setLoading(true);


    try {
      const response = await fetch("http://150.95.111.7:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });


      const data = await response.json();


      if (response.ok) {
        setMessage("✅ Đăng ký thành công! Đang đăng nhập...");


        // Tự động đăng nhập sau khi đăng ký
        const loginResponse = await fetch("http://150.95.111.7:3001/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });


        const loginData = await loginResponse.json();


        if (loginResponse.ok) {
          setMessage("✅ Đăng ký & đăng nhập thành công! Chuyển hướng...");
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } else {
          setMessage(`⚠️ Đăng ký thành công, nhưng lỗi khi đăng nhập: ${loginData.message}`);
        }
      } else {
        setMessage(`❌ ${data.message || "Có lỗi xảy ra!"}`);
      }
    } catch (error) {
      setMessage("❌ Không thể kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-[#f8f3eb] shadow-lg rounded-lg p-8 w-96">
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
          <h1 className="text-red-700 font-semibold text-lg">Đăng Kí</h1>
        </div>


        {/* Thông báo lỗi/thành công */}
        {message && (
          <div className={`mb-3 text-center text-sm ${message.includes("✅") ? "text-green-700" : "text-red-700"}`}>
            {message}
          </div>
        )}


        <form onSubmit={handleSubmit}>
          {/* Tên tài khoản */}
          <div className="mb-3">
            <label className="block text-gray-700 text-sm">Tên tài khoản</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-100"
              placeholder="Nhập tên tài khoản"
              required
            />
          </div>


          {/* Số điện thoại */}
          <div className="mb-3">
            <label className="block text-gray-700 text-sm">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-100"
              placeholder="Nhập số điện thoại"
              required
            />
          </div>


          {/* Email */}
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


          {/* Mật khẩu */}
          <div className="mb-3">
            <label className="block text-gray-700 text-sm">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-100"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>


          {/* Nhập lại mật khẩu */}
          <div className="mb-3">
            <label className="block text-gray-700 text-sm">Nhập lại mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-gray-100"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>


          {/* Nút Đăng ký */}
          <button
            type="submit"
            className="w-full bg-red-700 text-white py-2 rounded-md font-semibold hover:bg-red-800 transition"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng Ký"}
          </button>
        </form>


        {/* Quay lại đăng nhập */}
        <div className="text-center text-sm text-gray-600 mt-4">
          Đã có tài khoản?{" "}
          <a href="/" className="text-red-700 hover:underline">
            Đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
};


export default Register;