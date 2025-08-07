/**
 * Добавить сообщение в коллекцию "messages"
 * @param {string} text - текст сообщения
 * @param {string} userId - UID пользователя
 */
export async function sendMessage(text, userId) {
  if (!text || !userId) return;

  await firebase.firestore().collection("messages").add({
    text,
    user: userId,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Подписаться на сообщения (реальное время)
 * @param {function} callback - обработчик сообщений
 */
export function subscribeToMessages(callback) {
  const ref = firebase.firestore()
    .collection("messages")
    .orderBy("timestamp", "asc");

  return ref.onSnapshot(snapshot => {
    const messages = snapshot.docs.map(doc => doc.data());
    callback(messages);
  });
}