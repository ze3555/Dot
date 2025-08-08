// js/firebase/usernames.js
// Требует глобальный firebase (compat) и инициализацию в ./js/firebase/config.js

const db = firebase.firestore();
const auth = firebase.auth();

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const RESERVED = new Set([
  "admin","root","system","support","help","null","undefined",
  "owner","me","you","dot","contact","contacts"
]);

export function normalizeUsername(s) {
  return (s || "").trim().toLowerCase();
}

export function validateUsername(s) {
  const u = normalizeUsername(s);
  if (!u) throw new Error("Username required");
  if (!USERNAME_RE.test(u)) throw new Error("Use 3–20: a–z, 0–9, _");
  if (RESERVED.has(u)) throw new Error("Username is reserved");
  return u;
}

export async function isUsernameAvailable(username) {
  const u = validateUsername(username);
  const snap = await db.doc(`usernames/${u}`).get();
  return !snap.exists;
}

export async function getUserByUsername(username) {
  const u = normalizeUsername(username);
  if (!u) return null;
  const snap = await db.doc(`usernames/${u}`).get();
  if (!snap.exists) return null;
  const { uid } = snap.data() || {};
  if (!uid) return null;
  const userDoc = await db.doc(`users/${uid}`).get();
  return userDoc.exists ? { uid, ...userDoc.data() } : { uid };
}

/**
 * Установить/сменить username для текущего пользователя.
 * Гарантирует уникальность через транзакцию и переносит старую запись.
 * Возвращает установленный lower-ник (строку).
 */
export async function setMyUsername(nextUsername) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const next = validateUsername(nextUsername);
  const userRef = db.doc(`users/${user.uid}`);
  const nextRef = db.doc(`usernames/${next}`);

  // Узнаем предыдущий ник
  const userSnap = await userRef.get();
  const prevLower = (userSnap.exists ? userSnap.data()?.usernameLower : null) || null;
  const prevRef = prevLower ? db.doc(`usernames/${prevLower}`) : null;

  await db.runTransaction(async (tx) => {
    const nextDoc = await tx.get(nextRef);
    if (nextDoc.exists && nextDoc.data()?.uid !== user.uid) {
      throw new Error("Username not available");
    }

    // Резервируем новый ник
    tx.set(nextRef, { uid: user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });

    // Обновляем профиль
    tx.set(userRef, { username: next, usernameLower: next }, { merge: true });

    // Освобождаем старый ник (если был и он наш)
    if (prevRef && prevLower !== next) {
      const prevDoc = await tx.get(prevRef);
      if (prevDoc.exists && prevDoc.data()?.uid === user.uid) {
        tx.delete(prevRef);
      }
    }
  });

  return next;
}

/**
 * Добавить контакт по username (lower). Возвращает {status: 'added'|'already'|'not_found', contactUid?}
 */
export async function addContactByUsername(username) {
  const me = auth.currentUser;
  if (!me) throw new Error("Not authenticated");

  const u = normalizeUsername(username);
  if (!u) throw new Error("Username required");

  const nameDoc = await db.doc(`usernames/${u}`).get();
  if (!nameDoc.exists) return { status: "not_found" };
  const target = nameDoc.data();
  if (!target?.uid || target.uid === me.uid) {
    return { status: target?.uid === me.uid ? "already" : "not_found" };
  }

  const ref = db.doc(`users/${me.uid}/contacts/${target.uid}`);
  const existing = await ref.get();
  if (existing.exists) return { status: "already", contactUid: target.uid };

  await ref.set({
    contactUid: target.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return { status: "added", contactUid: target.uid };
}
