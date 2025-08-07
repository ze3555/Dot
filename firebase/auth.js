// firebase/auth.js
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from "./config.js";

const auth = getAuth(app);

export function watchAuthChanges(callback) {
  onAuthStateChanged(auth, user => {
    callback(user);
  });
}

export async function loginWithEmail(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
}

export async function loginAnonymously() {
  const res = await signInAnonymously(auth);
  return res.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  return res.user;
}

export async function logout() {
  await signOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export { auth };