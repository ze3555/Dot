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

  // ===== Messages stream =====
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
      nodes[i].textContent = m?.text || "";
    });

    // автоскролл вниз
    box.scrollTop = box.scrollHeight;
  });

  // ===== Composer / Send =====
  const form  = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const dot   = document.querySelector(".dot-core");
  if (!form || !input || !dot) return;

  // Отправка
  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = (input.value || "").trim();
    if (!text) return;

    const user = getCurrentUser();
    const uid = user?.uid || "anon";
    try {
      await sendMessage(text, uid);
      input.value = "";
      syncSendReady();        // выключаем кнопку
      input.focus();          // оставляем фокус для быстрого набора
    } catch (err) {
      console.error("[chat] sendMessage failed:", err);
    }
  };

  // === Dock logic: Dot → Send рядом с полем ===
  const syncSendReady = () => {
    const ready = !!input.value.trim();
    document.body.classList.toggle("dot-send-ready", ready);
  };

  const onFocus = () => {
    document.body.classList.add("dot-dock");
    syncSendReady();
  };

  const onBlur = () => {
    // Чуть задержим снятие dock, чтобы клик по Доту не терялся
    setTimeout(() => {
      document.body.classList.remove("dot-dock");
      document.body.classList.remove("dot-send-ready");
    }, 120);
  };

  input.addEventListener("focus", onFocus);
  input.addEventListener("blur", onBlur);
  input.addEventListener("input", syncSendReady);

  // Тап по Доту в режиме dock
  dot.addEventListener("click", (e) => {
    if (!document.body.classList.contains("dot-dock")) return;
    e.preventDefault();
    if (document.body.classList.contains("dot-send-ready")) {
      // есть текст → отправляем
      if (form.requestSubmit) form.requestSubmit(); else form.submit();
    } else {
      // пусто → просто фокус на поле
      input.focus();
    }
  });

  // На мобильных — если пользователь тапнул в зону сообщений, уберём dock
  document.getElementById("chat-messages")?.addEventListener("click", () => {
    if (document.activeElement === input) input.blur();
  });
}