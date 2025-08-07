// js/firebase/auth.js
import { auth } from "./config.js";
import {
  onAuthStateChanged as onAuthChanged,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

