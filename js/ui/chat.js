// js/ui/chat.js
import { sendMessage, subscribeToMessages } from "../firebase/db.js";
import { getCurrentUser } from "../firebase/auth.js";

let unsubscribe = null;

export async function renderChatUI() {
  const main = document.getElementById("main");
  if (!main) return;

  main.innerHTML = `
    <div class="chat-window">
      <div class="chat-messages" id="chat-messages"></div>
      <form id="chat-form" autocomplete="off">
        <input type="text" id="chat-input" class="chat-input" placeholder="Type a message..." />
        <button type="submit" class="chat-send-btn" aria-label="Send" style="opacity: 0; pointer-events: none;">
          Send
        </button>
      </form>
    </div>
  `;

  const user = await getCurrentUser();
  const userId = user?.uid || "anonymous";

  const messagesEl = document.getElementById("chat-messages");

  // Подписка на сообщения
  if (unsubscribe) unsubscribe();
  unsubscribe = subscribeToMessages((messages) => {
    messagesEl.innerHTML = "";
    for (const msg of messages) {
      const div = document.createElement("div");
      div.className = "chat-message";
      if (msg.user === userId) div.classList.add("from-me");
      div.textContent = msg.text;
      messagesEl.appendChild(div);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });

  // Отправка
  const form = document.getElementById("chat-form");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    await sendMessage(text, userId);
    input.value = "";
  };
}
