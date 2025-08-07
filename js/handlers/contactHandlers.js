import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

/**
 * Получает список контактов текущего пользователя.
 * Если документа нет — создаёт его с пустым массивом list.
 */
export async function getContacts() {
  const uid = auth.currentUser.uid;
  const ref = doc(db, "contacts", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { list: [] }); // создаём, если нет
    return [];
  }

  const data = snap.data();
  return Array.isArray(data.list) ? data.list : [];
}

/**
 * Добавляет UID другого пользователя в список контактов текущего пользователя.
 */
export async function addContact(contactUid) {
  const uid = auth.currentUser.uid;
  const ref = doc(db, "contacts", uid);

  // Обновление с arrayUnion
  await updateDoc(ref, {
    list: arrayUnion(contactUid)
  });
}
