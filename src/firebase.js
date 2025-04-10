// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDocs, query, collection, where } from "firebase/firestore";
import { doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCz5cVbu_4TC6DJScITsZmyqFsglZpXbLo",
  authDomain: "eurovote-2025.firebaseapp.com",
  projectId: "eurovote-2025",
  storageBucket: "eurovote-2025.firebasestorage.app",
  messagingSenderId: "738062588133",
  appId: "1:738062588133:web:6575bc70f78398784d1c0c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

// Update the current round
export const setCurrentRound = async (round) => {
  await setDoc(doc(db, "config", "settings"), { currentRound: round }, { merge: true });
};

// Get the current round
export const getCurrentRound = async () => {
  const docSnap = await getDoc(doc(db, "config", "settings"));
  return docSnap.exists() ? docSnap.data().currentRound : "none";
};

export const lockRunningOrder = async () => {
  await setDoc(doc(db, "config", "settings"), { runningOrderLocked: true }, { merge: true });
};

export const isRunningOrderLocked = async () => {
  const snap = await getDoc(doc(db, "config", "settings"));
  return snap.exists() ? snap.data().runningOrderLocked : false;
};

export const setGameState = async (stage, message = "", options = {}) => {
  const data = {
    stage,
    message,
    ...options
  };
  await setDoc(doc(db, "config", "gameState"), data, { merge: true });
};

export const generateScoreRevealFromVotes = async () => {
  const q = query(collection(db, "votes"), where("round", "==", "final"));
  const snapshot = await getDocs(q);

  const scoreReveal = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.voter && data.votes) {
      scoreReveal.push({
        voter: data.voter,
        votes: data.votes
      });
    }
  });

  // Sort alphabetically or randomly (your choice)
  scoreReveal.sort((a, b) => a.voter.localeCompare(b.voter));

  return scoreReveal;
};
