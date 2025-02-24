import React from "react";
import { Link } from "react-router-dom";

const ChessChat = () => {
  return (
    <div>
      {/* Thanh Navigation */}
            <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
              <div className="flex items-center">
                <img src="/images/chess-piece.png" alt="Cờ Tướng" className="w-10 h-10 mr-2" />
                <span className="text-xl font-bold">Cờ Tướng</span>
              </div>
              <ul className="flex space-x-6">
                <li>
                  <Link to="/" className="hover:text-yellow-400 transition duration-300">
                    Trang Chủ
                  </Link>
                </li>
                <li>
                  <Link to="/chess-offline" className="hover:text-yellow-400 transition duration-300">
                    Chơi với máy
                  </Link>
                </li>
                <li>
                  <Link to="/chess-online" className="hover:text-yellow-400 transition duration-300">
                    Chơi Online
                  </Link>
                </li>
                <li>
                  <Link to="/chess-chat" className="hover:text-yellow-400 transition duration-300">
                    Phòng CHat Cộng đồng 
                  </Link>
                </li><li>
                  <Link to="/chess-courses" className="hover:text-yellow-400 transition duration-300">
                    KHóa Học
                  </Link>
                </li><li>
                  <Link to="/chess-register" className="hover:text-yellow-400 transition duration-300">
                    Đăng Kí
                  </Link>
                </li><li>
                  <Link to="/chess-login" className="hover:text-yellow-400 transition duration-300">
                    Đăng Nhập
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
                <p>đây là trang chát cộng đồng có thể giao tiếp public với nhau </p>
            </div>
    </div>
    
  );
};

export default ChessChat;
