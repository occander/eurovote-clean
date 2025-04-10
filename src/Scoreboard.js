import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getCurrentRound } from './firebase';
import { getDoc, doc } from "firebase/firestore";


const getFlagUrl = (country) => {
  const fileMap = {
    "Sweden": "sweden.png",
    "France": "france.png",
    "Germany": "germany.png",
    "Italy": "italy.png",
    "Spain": "spain.png",
    "United Kingdom": "uk.png",
    "Ukraine": "ukraine.png",
    "Norway": "norway.png",
    "Finland": "finland.png",
    "Greece": "greece.png",
    "Ireland": "ireland.png",
    "Belgium": "belgium.png",
    "Netherlands": "netherlands.png",
    "Poland": "poland.png",
    "Armenia": "armenia.png",
    "Lithuania": "lithuania.png",
    "Austria": "austria.png",
    "Portugal": "portugal.png",
    "Israel": "israel.png",
    "Switzerland": "switzerland.png"
  };
  return `/flags/${fileMap[country] || ''}`;
};

function Scoreboard() {
  const [scores, setScores] = useState({});
const [finalOrder, setFinalOrder] = useState([]);
const [roundLabel, setRoundLabel] = useState("");

useEffect(() => {
  const fetchVotes = async () => {
    const round = await getCurrentRound(); // 🔁 Get current round
setRoundLabel(round === "semi1" ? "Semi-Final 1" :
              round === "semi2" ? "Semi-Final 2" :
              round === "final" ? "Grand Final" : "Unknown Round");
    const voteSnapshot = await getDocs(collection(db, "votes"));
    const tally = {};

    voteSnapshot.forEach(doc => {
      const voteData = doc.data();
      if (voteData.round !== round) return; // 🚫 Skip if not current round

      const { votes } = voteData;
      Object.entries(votes).forEach(([point, country]) => {
        if (!tally[country]) tally[country] = 0;
        tally[country] += parseInt(point);
      });
    });

    setScores(tally);

const settingsSnap = await getDoc(doc(db, "config", "settings"));
if (settingsSnap.exists() && settingsSnap.data().finalRunningOrder) {
  setFinalOrder(settingsSnap.data().finalRunningOrder);
}
  };

  fetchVotes();
}, []);



  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-800 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">EuroVote 2025 – Scoreboard</h1>

        {sortedScores.length === 0 ? (
          <p className="text-center text-gray-300">Waiting for votes...</p>
        ) : (
          <ul className="space-y-3">
            {sortedScores.map(([country, score], index) => (
              <li
                key={country}
                className="bg-white/10 backdrop-blur rounded-2xl px-6 py-4 flex justify-between items-center shadow-lg border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getFlagUrl(country)}
                    alt={country}
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                  <span className="text-lg font-semibold">{country}</span>
                </div>
                <span className="text-xl font-bold">{score} pts</span>
              </li>
            ))}
          </ul>
        )}
{finalOrder.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-bold text-center mb-4">🏁 Final Running Order</h2>
    <ol className="bg-white p-4 rounded-xl max-w-2xl mx-auto space-y-2 text-black shadow-md border">
      {finalOrder.map((country, index) => (
        <li key={index} className="flex items-center gap-3">
          <img
            src={`/flags/${country.toLowerCase().replace(" ", "-")}.png`}
            alt={country}
            className="w-6 h-4 rounded-sm"
          />
          <span className="font-semibold text-lg">{index + 1}. {country}</span>
        </li>
      ))}
    </ol>
  </div>
)}

<h2 className="text-xl text-center font-semibold mb-4 text-white/80">
  Showing Results for: <span className="text-white">{roundLabel}</span>
</h2>

      </div>
    </div>
  );
}

export default Scoreboard;
