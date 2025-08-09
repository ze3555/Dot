// js/chat/messages.js
import { initChatsStore, getMessages, getCurrentPeer, setCurrentPeer } from "../services/chats.js";

const DATE_FMT = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function createMsgEl(msg) {
  const el = document.createElement("div");
  el.className = `msg ${msg.from === "me" ? "me" : "peer"}`;
  el.dataset.id = msg.id;
  el.textContent = msg.text;
  return el;
}

function createDaySep(label) {
  const el = document.createElement("div");
  el.className = "day-sep";
  el.textContent = label;
  return el;
}

function render() {
  const root = document.getElementById("messages");
  if (!root) return;

  const peer = getCurrentPeer();
  const items = getMessages(peer);

  root.innerHTML = "";

  let currentDay = "";
  for (const m of items) {
    const k = dayKey(m.ts);
    if (k !== currentDay) {
      currentDay = k;
      const label = DATE_FMT.format(new Date(m.ts));
      root.appendChild(createDaySep(label));
    }
    root.appendChild(createMsgEl(m));
  }

  // автоскролл к низу
  root.scrollTop = root.scrollHeight + 1000;
}

export function setPeer(peer) {
  setCurrentPeer(peer);
  render();
}

// Экспорт в глобалку для простого вызова извне (например, из контактов)
if (typeof window !== "undefined") {
  window.DOT = window.DOT || {};
  window.DOT.setPeer = setPeer;
}

export function initMessagesView() {
  initChatsStore();
  render();
  window.addEventListener("dot:chats-changed", () => {
    render();
  });
}

// автоинициализация для модульного подключения
document.addEventListener("DOMContentLoaded", initMessagesView);