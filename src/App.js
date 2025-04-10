import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VotingPage from './VotingPage';
import Scoreboard from './Scoreboard';
import HostPanel from './HostPanel';
import LandingPage from './LandingPage';
import LivePage from './LivePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/vote" element={<VotingPage />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/host" element={<HostPanel />} />
        <Route path="/live" element={<LivePage />} />
      </Routes>
    </Router>
  );
}

export default App;
