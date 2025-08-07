// js/handlers/contactHandlers.js
import { db } from "../firebase/config.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Добавить контакт
export async function addContact(contactUid) {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser || !contactUid) return;

  const contactRef = doc(db, "users", currentUser.uid, "contacts", contactUid);
  await setDoc(contactRef, {
    addedAt: serverTimestamp()
  });
}

// Получить список контактов
export async function getContacts() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const contactsCol = collection(db, "users", currentUser.uid, "contacts");
  const snapshot = await getDocs(contactsCol);
  return snapshot.docs.map(doc => doc.id);
}

// Можно расширить позже — подписки и т.п.
export function setupContactHandlers() {
  // TODO: подписки или init-загрузка
}