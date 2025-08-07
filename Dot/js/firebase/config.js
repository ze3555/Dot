// js/firebase/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBkfA9hXpq3ccp_wnvWGQZo1ZMNSyiVv8Q",
  authDomain: "dot5-f25ea.firebaseapp.com",
  projectId: "dot5-f25ea",
  storageBucket: "dot5-f25ea.appspot.com",
  messagingSenderId: "841483524783",
  appId: "1:841483524783:web:dbfe06e7198d84d140d25a"
};

export function initFirebase() {
  initializeApp(firebaseConfig);
}
