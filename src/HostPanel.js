import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { setCurrentRound, lockRunningOrder, isRunningOrderLocked } from './firebase';
import { setGameState } from './firebase';
import { generateScoreRevealFromVotes } from './firebase';


function HostPanel() {
  const [votes, setVotes] = useState([]);
const [runningOrder, setRunningOrder] = useState([]);
const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    const fetchVotes = async () => {
      const voteSnapshot = await getDocs(collection(db, "votes"));
      const allVotes = voteSnapshot.docs.map(doc => doc.data());
      setVotes(allVotes);
    };

    fetchVotes();
  }, []);

const generateRunningOrder = async () => {
  const voteSnapshot = await getDocs(collection(db, "votes"));
  const semiTally = { semi1: {}, semi2: {} };
const locked = await isRunningOrderLocked();
  if (locked) {
    alert("Running order is locked and cannot be regenerated.");
    return;
  }

  // Tally scores for each semi-final
  voteSnapshot.forEach(doc => {
    const { round, votes } = doc.data();
    if (round !== "semi1" && round !== "semi2") return;

    Object.entries(votes).forEach(([point, country]) => {
      if (!semiTally[round][country]) semiTally[round][country] = 0;
      semiTally[round][country] += parseInt(point);
    });
  });

  // Get top 10 from each semi
  const top10From = (round) =>
    Object.entries(semiTally[round])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country]) => country);

  const semi1Finalists = top10From("semi1");
  const semi2Finalists = top10From("semi2");

  const bigFivePlus = [
    "France", "Germany", "Italy", "Spain", "United Kingdom", "Switzerland"
  ];

  const fullList = [...semi1Finalists, ...semi2Finalists, ...bigFivePlus];

  // Shuffle the running order
  const shuffled = [...fullList].sort(() => 0.5 - Math.random());

  setRunningOrder(shuffled);
  await setDoc(doc(db, "config", "settings"), { finalRunningOrder: shuffled }, { merge: true });
  await lockRunningOrder(); // Lock it after generating
};


  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">EuroVote 2025 – Host Panel 🎛️</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

<div className="mt-8 space-y-3">
  <h2 className="text-xl font-bold mb-2">🎛 Game State Controls</h2>

  <button
    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded w-full"
    onClick={() => setGameState("voting-semi1", "Voting is open for Semi-Final 1!")}
  >
    🔄 Voting – Semi-Final 1
  </button>

  <button
    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded w-full"
    onClick={() => setGameState("voting-semi2", "Voting is open for Semi-Final 2!")}
  >
    🔄 Voting – Semi-Final 2
  </button>

  <button
    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full"
    onClick={() => setGameState("semi1-results", "Here are the Semi-Final 1 Qualifiers!", {
      qualifiers: ["Sweden", "Ukraine", "Belgium", "Netherlands", "Portugal", "Norway", "Croatia", "Slovenia", "Estonia", "Iceland"]
    })}
  >
    🎉 Show Semi-Final 1 Qualifiers
  </button>

  <button
    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full"
    onClick={() => setGameState("semi2-results", "Here are the Semi-Final 2 Qualifiers!", {
      qualifiers: ["Austria", "Greece", "Israel", "Finland", "Ireland", "Lithuania", "Denmark", "Armenia", "Czechia", "Australia"]
    })}
  >
    🎉 Show Semi-Final 2 Qualifiers
  </button>

<button
  className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded w-full"
  onClick={() => setGameState("final-voting", "Grand Final Voting is now open!")}
>
  🗳️ Grand Final Voting
</button>

  <button
    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
    onClick={async () => {
      const snap = await getDoc(doc(db, "config", "settings"));
      const data = snap.data();
      const order = data.finalRunningOrder || [];
      await setGameState("running-order-reveal", "🏁 Here is the Final Running Order!", {
        runningOrder: order
      });
    }}
  >
    🏁 Reveal Final Running Order
  </button>

  <button
    className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded w-full"
    onClick={() => setGameState("end", "🎆 Thank you for joining EuroVote 2025!")}
  >
    🎆 End Show
  </button>

<button
  className="bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded w-full"
  onClick={async () => {
    const scoreReveal = await generateScoreRevealFromVotes();
    await setGameState("final-reveal", "🎤 Jury votes coming in!", { scoreReveal });
  }}
>
  🎬 Start Grand Final Score Reveal
</button>

</div>


<button
  className="bg-purple-600 ..."
  onClick={() => setCurrentRound("semi1")}
>
  🗳️ Semi-Final 1 Voting
</button>

<button
  className="bg-indigo-600 ..."
  onClick={() => setCurrentRound("semi2")}
>
  🗳️ Semi-Final 2 Voting
</button>

<button
  className="bg-green-600 ..."
  onClick={() => setCurrentRound("final")}
>
  🏁 Grand Final Voting
</button>

<button
  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow transition"
  onClick={generateRunningOrder}
>
  🎲 Generate Running Order
</button>

  <button
    className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-xl shadow transition"
onClick={() => {
  setRevealedCount(0);

  let count = 1; // start from 1 to show the first item immediately
  setRevealedCount(1);
  console.log("Revealing item 1");

  const interval = setInterval(() => {
    count++;
    console.log("Revealing item", count);
    setRevealedCount(prev => {
      if (count > runningOrder.length) {
        clearInterval(interval);
        return prev;
      }
      return count;
    });
  }, 1000);
}}





  >
    🎬 Start Final Running Order Reveal
  </button>



<button
  className="mt-4 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
  onClick={() => {
    const text = runningOrder.map((c, i) => `${i + 1}. ${c}`).join("\n");
    navigator.clipboard.writeText(text);
    alert("Running order copied to clipboard!");
  }}
>
  📋 Copy Running Order
</button>



</div>

      <h2 className="text-xl font-semibold mb-2">Submitted Votes:</h2>
      {votes.length === 0 ? (
        <p className="text-gray-500">No votes submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {votes.map((vote, i) => (
            <div key={i} className="border p-3 rounded bg-white shadow">
              <h3 className="font-bold">{vote.voter}</h3>
              <ul className="list-disc list-inside mt-2">
                {Object.entries(vote.votes).map(([point, country]) => (
                  <li key={point}>
                    {point} pts → {country}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

{runningOrder.length > 0 && (
  <div className="mt-10">
    <h2 className="text-2xl font-bold mb-4">🎤 Final Running Order</h2>

<p className="text-white">Revealed: {revealedCount}</p>
<ol className="space-y-2 list-decimal list-inside bg-white/20 p-4 rounded-xl border border-white/30 backdrop-blur text-black">
{runningOrder.slice(0, revealedCount).map((country, index) => (
  <li
    key={index}
    className="flex items-center gap-3 opacity-0 animate-fade-in"
    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
  >
    <img
      src={`/flags/${country.toLowerCase().replace(" ", "-")}.png`}
      alt={country}
      className="w-6 h-4 rounded-sm"
    />
    <span className="font-semibold text-lg text-black">{index + 1}. {country}</span>
  </li>
))}
    </ol>
  </div>
)}

    </div>
  );
}

export default HostPanel;
