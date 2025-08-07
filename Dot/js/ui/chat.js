// js/ui/chat.js

export function renderChatUI() {
  const main = document.getElementById("main");
  if (!main) return;

  main.innerHTML = `
    <div class="chat-window">
      <div class="chat-messages" id="chat-messages"></div>
      <form id="chat-form" autocomplete="off">
        <input
          type="text"
          id="chat-input"
          class="chat-input"
          placeholder="Type a message..."
        />
        <button type="submit" class="chat-send-btn" aria-label="Send" style="opacity: 0; pointer-events: none;">
          Send
        </button>
      </form>
    </div>
  `;
}
