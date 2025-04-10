import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BackgroudHome from "./components/backgroud-home-client";
import HomePage from "./components/home-page-client";
import ChessOffline from "./components/chess-offline-client";
import ChessOnline from "./components/chess-online-client";
import ChessChat from "./components/chess-chat-client";
import ChessCourses from "./components/chess-courses-client";
import CourseDetail from "./components/course-detail-client";
import ChessRegister from "./components/chess-register-client";
import ChessLogin from "./components/chess-login-client";
import EarthGlobeSpinner from "./components/chess-earth-client";
import ChessPuzzle from "./components/chess-puzzle-client";
import Tournament from "./components/tournament"
import ActiveGames from "./components/ActiveGames";
import SpectateGame from "./components/SpectateGame";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BackgroudHome />} />
        <Route path="/home-page-client" element={<HomePage />} />
        <Route path="/chess-offline-client" element={<ChessOffline />} />
        <Route path="/chess-online-client" element={<ChessOnline />} />
        <Route path="/chess-chat-client" element={<ChessChat />} />
        <Route path="/chess-courses-client" element={<ChessCourses />} />
        <Route path="/course-detail-client" element={<CourseDetail />} />
        <Route path="/chess-register-client" element={<ChessRegister />} />
        <Route path="/chess-login-client" element={<ChessLogin />} />
        <Route path="/chess-earth-client" element={<EarthGlobeSpinner />} />
        <Route path="/chess-puzzle-client" element={<ChessPuzzle/>} />
        <Route path="/tournament" element={<Tournament/>} />
        <Route path="/ActiveGames" element={<ActiveGames/>} />
        <Route path="/SpectateGame" element={<SpectateGame/>} />
        <Route path="/active-games" element={<ActiveGames />} />
        <Route path="/spectate/:roomId" element={<SpectateGame />} />
      </Routes>
    </Router>
  );
};

export default App;
