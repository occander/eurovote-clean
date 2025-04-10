import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-800 to-blue-600 text-white text-center p-6">
      <h1 className="text-4xl font-bold mb-6">🎤 EuroVote 2025</h1>
      <p className="text-lg mb-10">The ultimate Eurovision party game</p>

      <div className="space-y-4 w-full max-w-xs">
        <Link to="/Vote" className="block bg-white text-purple-800 py-3 px-6 rounded-xl text-lg font-semibold shadow hover:bg-gray-100 transition">
          Vote Now
        </Link>
        <Link to="/scoreboard" className="block bg-white text-purple-800 py-3 px-6 rounded-xl text-lg font-semibold shadow hover:bg-gray-100 transition">
          View Scoreboard
        </Link>
        <Link to="/host" className="block bg-white text-purple-800 py-3 px-6 rounded-xl text-lg font-semibold shadow hover:bg-gray-100 transition">
          Host Panel
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
