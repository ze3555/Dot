// Firebase SDK и Firestore подключаем в index.html через CDN или Vite/Parcel
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// UI logic (модули можно будет разбить позже)
const loginModal = document.getElementById('login-modal');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginSubmit = document.getElementById('login-submit');

// Firestore config — production
const firebaseConfig = {
  apiKey: "AIzaSyBkfA9hXpq3ccp_wnvWGQZo1ZMNSyiVv8Q",
  authDomain: "dot5-f25ea.firebaseapp.com",
  projectId: "dot5-f25ea",
  storageBucket: "dot5-f25ea.firebasestorage.app",
  messagingSenderId: "841483524783",
  appId: "1:841483524783:web:dbfe06e7198d84d140d25a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple auth simulation (заглушка)
loginSubmit.addEventListener('click', () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  loginModal.classList.add('hidden');
  console.log("Logged in as:", email);

  // future: here we would use Firebase Auth and fetch user profile/messages
});

// Check auth on load (заглушка)
document.addEventListener('DOMContentLoaded', () => {
  // TODO: if using Firebase Auth — check for currentUser
  loginModal.classList.remove('hidden');
});