// js/firebase/usernames.js
import { getFirestore, doc, setDoc, getDoc, runTransaction, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export function normalizeUsername(name) {
  return name.trim().toLowerCase();
}

export async function isUsernameAvailable(username) {
  const snap = await getDoc(doc(db, "usernames", normalizeUsername(username)));
  return !snap.exists();
}

export async function setMyUsername(username) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const usernameLc = normalizeUsername(username);
  const usernameRef = doc(db, "usernames", usernameLc);
  const userRef = doc(db, "users", user.uid);

  await runTransaction(db, async (tx) => {
    const existing = await tx.get(usernameRef);
    if (existing.exists()) throw new Error("Username taken");

    tx.set(usernameRef, { uid: user.uid });
    tx.set(userRef, {
      username,
      username_lc: usernameLc,
      createdAt: Date.now()
    }, { merge: true });
  });
}

export async function getUserByUsername(username) {
  const snap = await getDoc(doc(db, "usernames", normalizeUsername(username)));
  if (!snap.exists()) return null;
  return snap.data().uid;
}

export async function addContactByUsername(username) {
  const me = auth.currentUser;
  if (!me) throw new Error("Not signed in");

  const contactUid = await getUserByUsername(username);
  if (!contactUid) throw new Error("User not found");
  if (contactUid === me.uid) throw new Error("Cannot add yourself");

  const contactRef = doc(db, "users", me.uid, "contacts", contactUid);
  await setDoc(contactRef, {
    uid: contactUid,
    addedAt: Date.now()
  });
}