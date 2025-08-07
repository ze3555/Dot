const provider = new firebase.auth.GoogleAuthProvider();

/**
 * Отслеживание изменения состояния авторизации
 * @param {function} callback 
 */
export function onAuthStateChanged(callback) {
  firebase.auth().onAuthStateChanged(callback);
}

/**
 * Анонимный вход
 */
export async function loginAnonymously() {
  await firebase.auth().signInAnonymously();
}

/**
 * Вход через Google
 */
export async function loginWithGoogle() {
  await firebase.auth().signInWithPopup(provider);
}

/**
 * Выход из аккаунта
 */
export async function logout() {
  await firebase.auth().signOut();
}

/**
 * Получить текущего пользователя
 */
export function getCurrentUser() {
  return firebase.auth().currentUser;
}