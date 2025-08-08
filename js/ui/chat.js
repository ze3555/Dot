// js/ui/chat.js
import { sendMessage, subscribeToMessages } from "../firebase/db.js";
import { getCurrentUser } from "../firebase/auth.js";

let unsubscribe = null;

export async function renderChatUI() {
  const main = document.getElementById("main-content");
  if (!main) return;

  // Рисуем только окно сообщений: форма уже в index.html (bottom-panel)
  main.innerHTML = `
    <div class="chat-window">
      <div class="chat-messages" id="chat-messages" aria-live="polite"></div>
    </div>
  `;

  // ===== Stream сообщений =====
  if (unsubscribe) { try { unsubscribe(); } catch {} }
  unsubscribe = subscribeToMessages((messages) => {
    const box = document.getElementById("chat-messages");
    if (!box) return;

    box.innerHTML = messages.map(() => `
      <div class="chat-message">
        <div class="msg-text"></div>
      </div>
    `).join("");

    // безопасно кладём текст
    const nodes = box.querySelectorAll(".msg-text");
    messages.forEach((m, i) => { nodes[i].textContent = m?.text || ""; });

    // автоскролл
    box.scrollTop = box.scrollHeight;
  });

  // ===== Composer / отправка =====
  const form    = document.getElementById("chat-form");
  const input   = document.getElementById("chat-input");
  const dot     = document.querySelector(".dot-core");
  const sendBtn = document.querySelector(".chat-send-btn");
  if (!form || !input) return;

  // Если Дота нет — не скрываем старую кнопку
  if (!dot) document.body.classList.add("no-dot-core");

  // просьба клавиатуре: показывать “Send”
  input.setAttribute("enterkeyhint", "send");

  // общая функция отправки (для формы / Дота / старой кнопки)
  async function doSend() {
    const text = (input.value || "").trim();
    if (!text) return;
    const user = getCurrentUser();
    const uid  = user?.uid || "anon";
    await sendMessage(text, uid);
    input.value = "";
    syncSendReady();     // выключим кнопку
    input.focus();       // оставим фокус для быстрого набора
  }

  // сабмит формы
  form.onsubmit = (e) => {
    e.preventDefault();
    doSend().catch(err => console.error("[chat] sendMessage failed:", err));
  };

  // старая кнопка — как фолбэк и на десктопе
  if (sendBtn) {
    sendBtn.addEventListener("click", (e) => {
      e.preventDefault();
      doSend().catch(console.error);
    });
  }

  // ===== Dock Dot → Send рядом с полем =====
  const syncSendReady = () => {
    const ready = !!input.value.trim();
    document.body.classList.toggle("dot-send-ready", ready);
    if (sendBtn) sendBtn.toggleAttribute("disabled", !ready);
  };

  const onFocus = () => {
    document.body.classList.add("dot-dock");
    syncSendReady();
  };

  const onBlur = () => {
    // задержка, чтобы тап по Доту не терялся из-за blur
    setTimeout(() => {
      document.body.classList.remove("dot-dock");
      document.body.classList.remove("dot-send-ready");
    }, 120);
  };

  input.addEventListener("focus", onFocus);
  input.addEventListener("blur", onBlur);
  input.addEventListener("input", syncSendReady);

  // Тап по Доту, когда он докнут
  if (dot) {
    dot.addEventListener("click", (e) => {
      if (!document.body.classList.contains("dot-dock")) return;
      e.preventDefault();
      if (document.body.classList.contains("dot-send-ready")) {
        doSend().catch(console.error);
      } else {
        input.focus(); // пусто → просто фокус
      }
    });
  }

  // тап по сообщениям снимает фокус, прячет док
  document.getElementById("chat-messages")?.addEventListener("click", () => {
    if (document.activeElement === input) input.blur();
  });
}