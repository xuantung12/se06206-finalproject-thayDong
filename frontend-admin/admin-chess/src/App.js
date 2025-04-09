import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BackgroudHome from "./components/backgroud-home";
import HomePage from "./components/home-page";
import ChessOffline from "./components/chess-offline";
import ChessOnline from "./components/chess-online";
import ChessChat from "./components/chess-chat";
import ChessCourses from "./components/chess-courses";
import CourseDetail from "./components/course-detail";
import ChessRegister from "./components/chess-register";
import ChessLogin from "./components/chess-login";
import EarthGlobeSpinner from "./components/chess-earth";
import ChessPuzzle from "./components/chess-puzzle"
import Tournament from "./components/tournament"
import ActiveGames from "./components/ActiveGames";
import SpectateGame from "./components/SpectateGame";


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
        <Route path="/course-detail" element={<CourseDetail />} />
        <Route path="/chess-register" element={<ChessRegister />} />
        <Route path="/chess-login" element={<ChessLogin />} />
        <Route path="/chess-earth" element={<EarthGlobeSpinner />} />
        <Route path="/chess-puzzle" element={<ChessPuzzle/>} />
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
