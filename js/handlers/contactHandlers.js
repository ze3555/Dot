export async function getContacts() {
  const user = firebase.auth().currentUser;
  if (!user) throw new Error("User not authenticated");

  const uid = user.uid;
  const ref = firebase.firestore().doc(`contacts/${uid}`);
  const snap = await ref.get();

  // Если документа нет — создать пустой
  if (!snap.exists) {
    await ref.set({ list: [] });
    return [];
  }

  const data = snap.data();
  return Array.isArray(data.list) ? data.list : [];
}

export async function addContact(contactUid) {
  const user = firebase.auth().currentUser;
  if (!user) throw new Error("User not authenticated");

  const uid = user.uid;
  const ref = firebase.firestore().doc(`contacts/${uid}`);

  // Если документа нет — сначала создаём
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ list: [contactUid] });
  } else {
    await ref.update({
      list: firebase.firestore.FieldValue.arrayUnion(contactUid)
    });
  }
}
