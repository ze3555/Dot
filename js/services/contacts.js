
// js/services/contacts.js
// Локальный mock-стор контактов на базе localStorage.
// API минимальный и безопасный: можно заменить на бэкенд позже без правок UI.

const LS_KEY = "dot.contacts.v1";

function readStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeStore(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    dispatchChanged();
  } catch {}
}

function dispatchChanged() {
  window.dispatchEvent(new CustomEvent("dot:contacts-changed"));
}

export function listContacts() {
  return readStore();
}

export function normalizeUsername(u) {
  return (u || "").trim().toLowerCase();
}

export function validateUsername(u) {
  return /^[a-z0-9_]{3,20}$/.test(normalizeUsername(u));
}

export function isUsernameAvailable(u) {
  // В локальном контексте «доступен» = ещё не в списке
  const name = normalizeUsername(u);
  return !readStore().some(c => c.username === name);
}

export function addContactByUsername(u) {
  const username = normalizeUsername(u);
  if (!validateUsername(username)) {
    return { ok: false, error: "INVALID_USERNAME" };
  }
  const list = readStore();
  if (list.some(c => c.username === username)) {
    return { ok: true, duplicated: true };
  }
  const contact = {
    id: crypto.randomUUID(),
    username,
    displayName: username,
    createdAt: Date.now()
  };
  list.push(contact);
  writeStore(list);
  return { ok: true, contact };
}

export function removeContact(id) {
  const list = readStore();
  const next = list.filter(c => c.id !== id);
  if (next.length !== list.length) writeStore(next);
}

export function findByUsername(u) {
  const name = normalizeUsername(u);
  return readStore().find(c => c.username === name) || null;
}

export function onContactsChanged(handler) {
  window.addEventListener("dot:contacts-changed", handler);
  return () => window.removeEventListener("dot:contacts-changed", handler);
}