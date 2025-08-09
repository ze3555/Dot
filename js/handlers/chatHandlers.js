// js/handlers/chatHandlers.js
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

/**
 * Start chat with another user UID.
 * Finds existing chat with both participants, or creates a new one.
 */
export async function startChatWith(otherUid) {
  const me = auth.currentUser;
  if (!me) throw new Error("Not signed in");

  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", me.uid));
  const snap = await getDocs(q);

  let existing = null;
  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.participants.includes(otherUid)) {
      existing = { id: docSnap.id, ...data };
    }
  });

  if (existing) return existing.id;

  const newChat = await addDoc(chatsRef, {
    participants: [me.uid, otherUid],
    updatedAt: serverTimestamp(),
    lastMessage: null
  });

  return newChat.id;
}

/**
 * Send a message in a chat.
 */
export async function sendMessage(chatId, text) {
  const me = auth.currentUser;
  if (!me) throw new Error("Not signed in");
  if (!text.trim()) return;

  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    sender: me.uid,
    text: text.trim(),
    createdAt: serverTimestamp()
  });
}

/**
 * Subscribe to all chats for the current user.
 */
export function subscribeChats(callback) {
  const me = auth.currentUser;
  if (!me) throw new Error("Not signed in");

  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", me.uid), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(chats);
  });
}

/**
 * Subscribe to messages in a specific chat.
 */
export function subscribeMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}