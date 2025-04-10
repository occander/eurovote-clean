import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from './firebase';

function LivePage() {
  const [gameState, setGameState] = useState({
    stage: "loading",
    message: "Preparing the stage...",
    qualifiers: [],
    runningOrder: [],
  });

  const [revealedQualifiers, setRevealedQualifiers] = useState([]);
const [liveScores, setLiveScores] = useState({});
const [currentJuryIndex, setCurrentJuryIndex] = useState(0);
const [currentJury, setCurrentJury] = useState(null);


  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "gameState"), (docSnap) => {
      if (docSnap.exists()) {
	const data = docSnap.data();
        setGameState(data);
      // Animate qualifier reveal if stage includes results
      if ((data.stage === "semi1-results" || data.stage === "semi2-results") && data.qualifiers) {
        setRevealedQualifiers([]); // Reset first
        let count = 0;
        const interval = setInterval(() => {
          count++;
          setRevealedQualifiers(prev => [...prev, data.qualifiers[count - 1]]);
          if (count >= data.qualifiers.length) {
            clearInterval(interval);
          }
        }, 1000);
      } else if (data.stage === "final-reveal" && data.scoreReveal) {
  setLiveScores({}); // Reset scores
  setCurrentJuryIndex(0);
  setCurrentJury(null);

  let index = 0;
  const revealNext = () => {
    if (index >= data.scoreReveal.length) return;

    const jury = data.scoreReveal[index];
    setCurrentJury(jury);

    setLiveScores(prev => {
      const newScores = { ...prev };
      Object.entries(jury.votes).forEach(([points, country]) => {
        if (!newScores[country]) newScores[country] = 0;
        newScores[country] += parseInt(points);
      });
      return newScores;
    });

    index++;
    setCurrentJuryIndex(index);

    setTimeout(revealNext, 2500); // Adjust delay between juries
  };

  setTimeout(revealNext, 1000); // Start the first one
} else {
        setRevealedQualifiers([]);
      }
    }
  });


    return () => unsub();
  }, []);

  const { stage, message, qualifiers, runningOrder } = gameState;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">🎤 EuroVote 2025 – Live Show</h1>

      <p className="text-xl mb-8 italic">{message}</p>

      {stage === "semi1-results" || stage === "semi2-results" ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Qualifiers (in no particular order):</h2>
          <ul className="text-lg space-y-2 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur w-full max-w-md">
            {revealedQualifiers.map((country, index) => (
  <li
    key={index}
    className="opacity-0 animate-fade-in text-lg"
    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
  >
    {country}
  </li>
))}

          </ul>
        </>
      ) : null}

      {stage === "running-order-reveal" && runningOrder?.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-4">🏁 Final Running Order</h2>
          <ol className="space-y-2 list-decimal list-inside bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur w-full max-w-md">
            {runningOrder.map((country, index) => (
              <li key={index}>{country}</li>
            ))}
          </ol>
        </>
      )}
{stage === "final-reveal" && (
  <div className="mt-10 w-full max-w-2xl">
    <h2 className="text-2xl font-bold mb-4">🧮 Grand Final Scoreboard</h2>

    {currentJury && (
      <div className="mb-6 text-center text-xl font-semibold text-yellow-300">
        {currentJury.voter} has voted!
        <br />
        {Object.entries(currentJury.votes).map(([points, country]) => (
          <div key={points}>{points} points → {country}</div>
        ))}
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Scoreboard Left */}
  <div>
    <ul className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur space-y-2 text-white text-lg">
      {Object.entries(liveScores)
  .sort((a, b) => b[1] - a[1])
  .map(([country, score], index) => {
    const currentPoints = currentJury?.votes
      ? Object.entries(currentJury.votes).find(([, c]) => c === country)?.[0]
      : null;

    // Assign top 3 glow classes
    let glowClass = "";
    if (index === 0) glowClass = "text-yellow-300 font-extrabold animate-pulse";
    else if (index === 1) glowClass = "text-gray-300 font-semibold";
    else if (index === 2) glowClass = "text-orange-300 font-semibold";

    return (
      <li key={country} className={`flex justify-between items-center ${glowClass}`}>
              <span>{country}</span>
              <span>
<span className="bg-black/30 px-2 py-1 rounded">{score}</span>
                {currentPoints && (
                  <span className="text-yellow-400 text-sm ml-2 animate-pulse">
                    (+{currentPoints})
                  </span>
                )}
              </span>
            </li>
          );
        })}
    </ul>
  </div>

  {/* Current Vote Right */}
  <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur text-white text-lg">
    <h3 className="text-xl font-bold text-yellow-300 mb-2">
      {currentJury?.voter} has voted!
    </h3>
    {currentJury?.votes &&
      Object.entries(currentJury.votes)
        .sort((a, b) => b[0] - a[0])
        .map(([points, country]) => (
          <div key={points}>
            {points} points → <strong>{country}</strong>
          </div>
        ))}
  </div>
</div>

  </div>
)}


    </div>


  );
}

export default LivePage;
