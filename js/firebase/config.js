// js/firebase/config.js

const firebaseConfig = {
  apiKey: "AIzaSyAq2bMRB11Z0ghEjos_9cpXgTbaEbeYebU",
  authDomain: "dot1-80b37.firebaseapp.com",
  projectId: "dot1-80b37",
  storageBucket: "dot1-80b37.appspot.com",
  messagingSenderId: "839467070924",
  appId: "1:839467070924:web:a7dce6de55f75cc1fb5969",
  measurementId: "G-HPS8HVC96W"
};

// Инициализация Firebase глобально
firebase.initializeApp(firebaseConfig);
firebase.auth();
firebase.firestore();