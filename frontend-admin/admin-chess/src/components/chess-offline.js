import React from "react";
import { Link } from "react-router-dom";


const ChessOffline = () => {
  return (
    <div>
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
        </ul>
      </nav>

      <div>
        <h1>Chào mừng đến với Chess Offline</h1>
        <iframe src="/static/index.html" width="100%" height="800px" title="Chess Game"></iframe>
      </div>
    </div>
  );
};

export default ChessOffline;