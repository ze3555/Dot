// js/firebase/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAq2bMRB11Z0ghEjos_9cpXgTbaEbeYebU",
  authDomain: "dot1-80b37.firebaseapp.com",
  projectId: "dot1-80b37",
  storageBucket: "dot1-80b37.appspot.com", // ← исправлено: должно быть .appspot.com
  messagingSenderId: "839467070924",
  appId: "1:839467070924:web:a7dce6de55f75cc1fb5969",
  measurementId: "G-HPS8HVC96W"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
