// js/services/contacts.js
// Локальное мок‑хранилище контактов с persistence в localStorage.
// Формат записи: { username: string, addedAt: number }

const LS_KEY = "dot.contacts.v1";
const RE_USERNAME = /^[a-z0-9_]{3,20}$/;

let CONTACTS = [];

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        CONTACTS = arr
          .filter(x => x && typeof x.username === "string")
          .map(x => ({ username: String(x.username), addedAt: Number(x.addedAt) || Date.now() }));
      }
    }
  } catch {}
}
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(CONTACTS)); } catch {}
}

// простая шина событий для UI
function emitChanged() {
  window.dispatchEvent(new CustomEvent("dot:contacts-changed", { detail: { total: CONTACTS.length } }));
}

export function initContactsStore() {
  load();
  // первичная инициализация — можно закинуть примеры, если пусто:
  if (CONTACTS.length === 0) {
    CONTACTS = [
      { username: "alpha", addedAt: Date.now() - 86400000 * 2 },
      { username: "bravo_dev", addedAt: Date.now() - 86400000 },
    ];
    save();
  }
  emitChanged();
}

export function all() {
  return [...CONTACTS].sort((a,b) => a.username.localeCompare(b.username));
}

export function search(prefix) {
  const q = String(prefix || "").trim().toLowerCase();
  if (!q) return all();
  return all().filter(c => c.username.startsWith(q));
}

export function canAdd(username) {
  const u = String(username || "").trim().toLowerCase();
  return RE_USERNAME.test(u) && !CONTACTS.some(c => c.username === u);
}

export function add(username) {
  const u = String(username || "").trim().toLowerCase();
  if (!RE_USERNAME.test(u)) return false;
  if (CONTACTS.some(c => c.username === u)) return false;
  CONTACTS.push({ username: u, addedAt: Date.now() });
  save(); emitChanged();
  return true;
}

export function remove(username) {
  const u = String(username || "").trim().toLowerCase();
  const prevLen = CONTACTS.length;
  CONTACTS = CONTACTS.filter(c => c.username !== u);
  if (CONTACTS.length !== prevLen) { save(); emitChanged(); return true; }
  return false;
}
