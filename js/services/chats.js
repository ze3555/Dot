// js/services/chats.js
// Локальный мок-хранилище чатов с persistence в localStorage.
// Структура: { [peer: string]: { messages: Msg[] } }
// Msg: { id: string, from: 'me'|'peer', text: string, ts: number, status: 'sent' }

const LS_KEY = "dot.chats.v1";
let STORE = {};
let CURRENT_PEER = "demo";

// --- utils ---
const now = () => Date.now();
const rid = () => Math.random().toString(36).slice(2, 10);

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") {
      STORE = obj;
    }
  } catch (_) {}
}

function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(STORE));
  } catch (_) {}
}

function ensurePeer(peer) {
  const p = String(peer || "").trim().toLowerCase();
  if (!p) return "demo";
  if (!STORE[p]) STORE[p] = { messages: [] };
  return p;
}

// --- public API ---
export function initChatsStore() {
  load();
  // seed demo
  if (!STORE.demo) {
    STORE.demo = {
      messages: [
        { id: rid(), from: "peer", text: "👋 Привет! Это демо-чат.", ts: now() - 1000 * 60 * 60 * 2, status: "sent" },
        { id: rid(), from: "me",   text: "Работает. Пишу первое сообщение.", ts: now() - 1000 * 60 * 60, status: "sent" }
      ]
    };
    save();
  }
  dispatchChange(null);
}

export function listPeers() {
  return Object.keys(STORE);
}

export function setCurrentPeer(peer) {
  CURRENT_PEER = ensurePeer(peer);
  dispatchChange(CURRENT_PEER);
}

export function getCurrentPeer() {
  return CURRENT_PEER || "demo";
}

export function getMessages(peer) {
  const p = ensurePeer(peer || getCurrentPeer());
  return (STORE[p]?.messages || []).slice().sort((a,b) => a.ts - b.ts);
}

export function send(peer, text) {
  const p = ensurePeer(peer || getCurrentPeer());
  const msg = { id: rid(), from: "me", text: String(text || ""), ts: now(), status: "sent" };
  STORE[p].messages.push(msg);
  save();
  dispatchChange(p);
  return msg;
}

// helper для симуляции входящих (можно дергать из консоли)
export function simulateIncoming(peer, text) {
  const p = ensurePeer(peer || getCurrentPeer());
  const msg = { id: rid(), from: "peer", text: String(text || ""), ts: now(), status: "sent" };
  STORE[p].messages.push(msg);
  save();
  dispatchChange(p);
  return msg;
}

// --- events ---
function dispatchChange(peer) {
  window.dispatchEvent(new CustomEvent("dot:chats-changed", { detail: { peer: peer || getCurrentPeer() }}));
}