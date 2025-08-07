// js/firebase/auth.js
import { app } from "./config.js"; // ✅ импорт инициализированного app
import {
  getAuth,
  onAuthStateChanged as onAuthChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(app); // ✅ используем инициализированное приложение
const provider = new GoogleAuthProvider();

export function onAuthStateChanged(callback) {
  onAuthChanged(auth, callback);
}

export async function loginAnonymously() {
  await signInAnonymously(auth);
}

export async function loginWithGoogle() {
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}
