import React from "react";
import { Link } from "react-router-dom";

const ChessOnline = () => {
  return (
    <div className="text-center mt-10">
      <h2 className="text-3xl font-bold text-gray-800">Chơi Online</h2>
      <p className="text-gray-600 mt-2">Chế độ chơi với người khác</p>
      <Link to="/" className="text-blue-500 mt-4 inline-block">
        Quay lại Trang Chủ
      </Link>
    </div>
  );
};

export default ChessOnline;
