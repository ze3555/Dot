// js/firebase/usernames.js
// Предполагается, что firebase инициализирован в ./js/firebase/config.js
// и доступен глобально через window.firebase (compat CDN уже в index.html).

const db = firebase.firestore();
const auth = firebase.auth();

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const RESERVED = new Set([
  'admin','root','system','support','help','null','undefined','owner','me','you','dot','contact','contacts'
]);

export function normalizeUsername(s) {
  return (s || '').trim().toLowerCase();
}

export function validateUsername(username) {
  const u = normalizeUsername(username);
  if (!u) throw new Error('Username is required');
  if (!USERNAME_RE.test(u)) throw new Error('3–20 chars: a–z, 0–9, underscore');
  if (RESERVED.has(u)) throw new Error('This username is reserved');
  return u;
}

/**
 * Проверка доступности имени
 * @returns {Promise<boolean>} true — свободно
 */
export async function isUsernameAvailable(username) {
  const u = validateUsername(username);
  const snap = await db.doc(`usernames/${u}`).get();
  return !snap.exists;
}

/**
 * Атомарно резервирует username и проставляет его пользователю.
 * Делается транзакцией:
 *  1) Проверяем, что /usernames/{u} не существует
 *  2) Создаём /usernames/{u} = { uid, createdAt }
 *  3) Обновляем /users/{uid}.username = u, usernameLower = u
 */
export async function setMyUsername(username) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const u = validateUsername(username);
  const unameRef = db.doc(`usernames/${u}`);
  const userRef  = db.doc(`users/${user.uid}`);

  return db.runTransaction(async (tx) => {
    const unameDoc = await tx.get(unameRef);
    if (unameDoc.exists) {
      throw new Error('Username is taken');
    }

    // создаём запись в реестре имён
    tx.set(unameRef, {
      uid: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // апдейтим профиль пользователя
    tx.set(userRef, {
      uid: user.uid,
      username: u,
      usernameLower: u,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return u;
  });
}

/**
 * Поиск пользователя по username
 * @returns {Promise<{uid:string, username:string} | null>}
 */
export async function getUserByUsername(username) {
  const u = normalizeUsername(username);
  if (!u) return null;

  const reg = await db.doc(`usernames/${u}`).get();
  if (!reg.exists) return null;

  const uid = reg.data().uid;
  const prof = await db.doc(`users/${uid}`).get();
  if (!prof.exists) return { uid, username: u };

  const data = prof.data();
  return { uid, username: data.username || u, ...data };
}

/**
 * Добавить контакт по username (однонаправленно).
 * Создаёт /users/{myUid}/contacts/{contactUid}
 */
export async function addContactByUsername(username) {
  const me = auth.currentUser;
  if (!me) throw new Error('Not authenticated');

  const target = await getUserByUsername(username);
  if (!target) throw new Error('User not found');
  if (target.uid === me.uid) throw new Error('Cannot add yourself');

  const docRef = db.doc(`users/${me.uid}/contacts/${target.uid}`);
  const doc = await docRef.get();
  if (doc.exists) {
    return { status: 'already', contactUid: target.uid };
  }

  await docRef.set({
    contactUid: target.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  return { status: 'added', contactUid: target.uid };
}
