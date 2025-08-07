import { db } from "./config.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Добавить сообщение
export async function sendMessage(text, userId) {
  if (!text || !userId) return;
  await addDoc(collection(db, "messages"), {
    text,
    user: userId,
    timestamp: serverTimestamp()
  });
}

// Подписка на новые сообщения
export function subscribeToMessages(callback) {
  const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
    callback(messages);
  });
}
