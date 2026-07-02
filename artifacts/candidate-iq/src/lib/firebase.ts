import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDH0sbSTt-v8WmGdlx5GDBrm04kTendHkM",
  authDomain: "skilldockk.firebaseapp.com",
  projectId: "skilldockk",
  storageBucket: "skilldockk.firebasestorage.app",
  messagingSenderId: "340575230873",
  appId: "1:340575230873:web:d574466c8d940370ff9108",
  measurementId: "G-GQLVE87X6J",
};

export function getFirebaseApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}
