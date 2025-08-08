// js/firebase/auth.js

const provider = new firebase.auth.GoogleAuthProvider();

/**
 * Отслеживание изменения состояния авторизации
 * @param {function} callback 
 */
export function onAuthStateChanged(callback) {
  firebase.auth().onAuthStateChanged(callback);
}

/** Анонимный вход */
export async function loginAnonymously() {
  await firebase.auth().signInAnonymously();
}

/** Вход через Google */
export async function loginWithGoogle() {
  await firebase.auth().signInWithPopup(provider);
}

/** Выход */
export async function logout() {
  await firebase.auth().signOut();
}

/** Текущий пользователь */
export function getCurrentUser() {
  return firebase.auth().currentUser;
}

/** Регистрация по email+password */
export async function signUpWithEmail(email, password) {
  if (!email || !password) throw new Error("Email и пароль обязательны");
  await firebase.auth().createUserWithEmailAndPassword(email, password);
}

/** Логин по email+password */
export async function signInWithEmail(email, password) {
  if (!email || !password) throw new Error("Email и пароль обязательны");
  await firebase.auth().signInWithEmailAndPassword(email, password);
}

/** Сброс пароля (письмо на email) */
export async function sendPasswordReset(email) {
  if (!email) throw new Error("Укажи email");
  await firebase.auth().sendPasswordResetEmail(email);
}
