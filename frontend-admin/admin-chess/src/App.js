import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BackgroudHome from "./components/backgroud-home";
import HomePage from "./components/home-page";
import ChessOffline from "./components/chess-offline";
import ChessOnline from "./components/chess-online";
import ChessChat from "./components/chess-chat";
import ChessCourses from "./components/chess-courses";
import ChessRegister from "./components/chess-register";
import ChessLogin from "./components/chess-login";
import EarthGlobeSpinner from "./components/chess-earth";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BackgroudHome />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/chess-offline" element={<ChessOffline />} />
        <Route path="/chess-online" element={<ChessOnline />} />
        <Route path="/chess-chat" element={<ChessChat />} />
        <Route path="/chess-courses" element={<ChessCourses />} />
        <Route path="/chess-register" element={<ChessRegister />} />
        <Route path="/chess-login" element={<ChessLogin />} />
        <Route path="/chess-earth" element={<EarthGlobeSpinner />} />
      </Routes>
    </Router>
  );
};

export default App;
