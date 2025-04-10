import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getCurrentRound } from './firebase';
import { getDoc, doc } from "firebase/firestore"; // already have firestore, just add these


const points = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
const semiFinal1Countries = [
  "Iceland", "Poland", "Slovenia", "Estonia", "Ukraine",
  "Sweden", "Portugal", "Norway", "Belgium", "Azerbaijan",
  "San Marino", "Albania", "Netherlands", "Croatia", "Cyprus"
];

const semiFinal2Countries = [
  "Australia", "Montenegro", "Ireland", "Latvia", "Armenia",
  "Austria", "Greece", "Lithuania", "Malta", "Georgia",
  "Denmark", "Czechia", "Luxembourg", "Israel", "Serbia", "Finland"
];

const finalOnlyCountries = [
  "France", "Germany", "Italy", "Spain", "United Kingdom", "Switzerland"
];



function VotingPage() {
  const [voterName, setVoterName] = useState('');
  const [votes, setVotes] = useState({});
  const [currentRound, setCurrentRound] = useState("");
const [finalRunningOrder, setFinalRunningOrder] = useState([]);
  
    useEffect(() => {
    const fetchRound = async () => {
      const round = await getCurrentRound();
      setCurrentRound(round);
    };
    fetchRound();
  }, []);

useEffect(() => {
  const fetchFinalOrder = async () => {
    const snap = await getDoc(doc(db, "config", "settings"));
    if (snap.exists()) {
      const data = snap.data();
      if (data.finalRunningOrder) {
        setFinalRunningOrder(data.finalRunningOrder);
      }
    }
  };

  if (currentRound === "final") {
    fetchFinalOrder();
  }
}, [currentRound]);

  const handleVoteChange = (point, country) => {
    setVotes(prev => ({ ...prev, [point]: country }));
  };

  const handleSubmit = async () => {
    if (!voterName || Object.keys(votes).length !== 10) return;

    try {
      const round = await getCurrentRound(); // get the current round from Firestore

      await addDoc(collection(db, "votes"), {
        voter: voterName,
        votes,
        round, // 🆕 store the round with this vote
        timestamp: new Date()
      });

      alert("Votes submitted successfully! 🎉");
      setVoterName('');
      setVotes({});
    } catch (error) {
      console.error("Error saving vote:", error);
      alert("Oops! Something went wrong.");
    }
  };

let countries = [];

if (currentRound === "semi1") {
  countries = semiFinal1Countries;
} else if (currentRound === "semi2") {
  countries = semiFinal2Countries;
} else if (currentRound === "final") {
  countries = finalRunningOrder;
}

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">EuroVote 2025 - Cast Your Vote</h1>
{currentRound && (
  <p className="text-sm text-gray-600 mb-4 italic">
    Voting is currently open for: <strong>{currentRound.toUpperCase()}</strong>
  </p>
)}
      <input
        type="text"
        placeholder="Your Name"
        className="border p-2 mb-4 w-full"
        value={voterName}
        onChange={(e) => setVoterName(e.target.value)}
      />

      {points.map(point => {
  const selectedCountry = votes[point];
  const otherSelectedCountries = Object.entries(votes)
    .filter(([p]) => parseInt(p) !== point)
    .map(([, c]) => c);

  const filteredCountries = countries.filter(
    (c) => !otherSelectedCountries.includes(c) || c === selectedCountry
  );

  return (
    <div key={point} className="mb-2">
      <label className="block font-semibold">🇪🇺 {point} points go to:</label>
      <select
        className="border p-2 w-full"
        value={selectedCountry || ""}
        onChange={(e) => handleVoteChange(point, e.target.value)}
      >
        <option value="">-- Select a country --</option>
        {filteredCountries.map(country => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
    </div>
  );
})}


      <button
        className="bg-blue-600 text-white py-2 px-4 mt-4 rounded"
        onClick={handleSubmit}
        disabled={!voterName || Object.keys(votes).length < 10}
      >
        Submit Vote
      </button>
    </div>
  );
}

export default VotingPage;
