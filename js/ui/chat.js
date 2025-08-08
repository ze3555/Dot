// js/ui/chat.js
import { sendMessage, subscribeToMessages } from "../firebase/db.js";
import { getCurrentUser } from "../firebase/auth.js";

let unsubscribe = null;

export async function renderChatUI() {
  const main = document.getElementById("main-content");
  if (!main) return;

  // Только окно сообщений; форма уже есть в index.html (bottom-panel)
  main.innerHTML = `
    <div class="chat-window">
      <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
    </div>
  `;

  // Подписка на сообщения
  if (unsubscribe) { try { unsubscribe(); } catch {} }
  unsubscribe = subscribeToMessages((messages) => {
    const box = document.getElementById("chat-messages");
    if (!box) return;
    box.innerHTML = messages.map(m => `
      <div class="chat-message">
        <div class="msg-text"></div>
      </div>
    `).join("");

    // Заполняем текст отдельно (экранируем)
    const nodes = box.querySelectorAll(".chat-message .msg-text");
    messages.forEach((m, i) => {
      nodes[i].textContent = m.text || "";
    });

    box.scrollTop = box.scrollHeight;
  });

  // Отправка через already-existing #chat-form
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  if (form && input) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      const user = getCurrentUser();
      const uid = user?.uid || "anon";
      await sendMessage(text, uid);
      input.value = "";
    };
  }
}
