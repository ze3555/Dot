// js/ui/dot-badge.js
// Бейдж непрочитанных поверх #dot-core через data-атрибут.
// Хранит "прочитано до" отдельно в localStorage, не трогая чат-стор.

import { listPeers, getMessages, getCurrentPeer } from "../services/chats.js";

const READ_KEY = "dot.read.v1";
let READ = loadRead();

function loadRead() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch { return {}; }
}
function saveRead() {
  try { localStorage.setItem(READ_KEY, JSON.stringify(READ)); } catch {}
}

function lastIncomingTs(peer) {
  let ts = 0;
  const msgs = getMessages(peer);
  for (const m of msgs) {
    if (m.from === "peer" && m.ts > ts) ts = m.ts;
  }
  return ts;
}

function peerUnreadCount(peer) {
  const cursor = READ[peer] || 0;
  let n = 0;
  const msgs = getMessages(peer);
  for (const m of msgs) {
    if (m.from === "peer" && m.ts > cursor) n++;
  }
  return n;
}

function computeTotalUnread() {
  let total = 0;
  for (const p of listPeers()) {
    total += peerUnreadCount(p);
  }
  return total;
}

function updateBadge() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;
  const total = computeTotalUnread();
  const label = total > 99 ? "99+" : String(total);
  dot.setAttribute("data-unread", label);
}

function markSeen(peer) {
  const p = String(peer || getCurrentPeer());
  READ[p] = lastIncomingTs(p);
  saveRead();
  updateBadge();
}

export function initDotBadge() {
  // сразу считаем текущий чат прочитанным
  markSeen(getCurrentPeer());
  updateBadge();

  // любое изменение в чатах → обновить бейдж
  window.addEventListener("dot:chats-changed", (e) => {
    const current = getCurrentPeer();
    // если событие касается текущего — считаем прочитанным
    if (e?.detail?.peer === current) markSeen(current);
    else updateBadge();
  });

  // при возврате на вкладку — помечаем текущий как прочитанный
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      markSeen(getCurrentPeer());
    }
  });
}