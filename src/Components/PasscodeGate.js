import React, { useState, useEffect } from 'react';

const PasscodeGate = ({ children }) => {
  const [accessGranted, setAccessGranted] = useState(false);
  const [passcode, setPasscode] = useState("");

  const CORRECT_CODE = "euro2025";

  useEffect(() => {
    const stored = localStorage.getItem("eurovote_passcode");
    if (stored === CORRECT_CODE) {
      setAccessGranted(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passcode === CORRECT_CODE) {
      localStorage.setItem("eurovote_passcode", passcode);
      setAccessGranted(true);
    } else {
      alert("Wrong code! Try again.");
    }
  };

  if (accessGranted) return children;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🎤 EuroVote 2025</h1>
      <p className="mb-4 text-white/70">Enter passcode to continue</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Passcode"
          className="p-2 rounded text-black"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
        />
        <button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded"
        >
          Enter
        </button>
      </form>
    </div>
  );
};

export default PasscodeGate;
