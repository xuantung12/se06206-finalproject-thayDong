import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/home-page";
import ChessOffline from "./components/chess-offline";
import ChessOnline from "./components/chess-online";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chess-offline" element={<ChessOffline />} />
        <Route path="/chess-online" element={<ChessOnline />} />
      </Routes>
    </Router>
  );
};

export default App;
