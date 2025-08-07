// js/handlers/dotMoveHandler.js

export function setupDotMoveOnInput() {
  const dot = document.querySelector('.dot-core');
  const bottomPanel = document.querySelector('.bottom-panel');
  const topbar = document.querySelector('.topbar');
  if (!dot || !bottomPanel || !topbar) return;

  let lastDotParent = null;

  // При фокусе на поле ввода — dot уходит вниз
  bottomPanel.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('chat-input')) {
      if (!bottomPanel.contains(dot)) {
        lastDotParent = dot.parentElement;
        bottomPanel.appendChild(dot);
        dot.style.position = '';
        dot.style.left = '';
        dot.style.top = '';
        dot.style.transform = '';
      }
    }
  });

  // При потере фокуса — dot возвращается наверх (или в последнее место)
  bottomPanel.addEventListener('focusout', (e) => {
    if (e.target.classList.contains('chat-input')) {
      // Вернуть dot только если был перемещён
      if (lastDotParent && !lastDotParent.contains(dot)) {
        lastDotParent.appendChild(dot);
      }
    }
  });

  // Обработка отправки сообщения по клику на dot-core
  dot.addEventListener('click', () => {
    if (bottomPanel.contains(dot)) {
      const input = bottomPanel.querySelector('.chat-input');
      const text = input.value.trim();
      if (!text) return;
      // TODO: вставь свою функцию отправки сообщения!
      // sendMessageToChat(currentChatId, text);
      input.value = '';
    }
  });
}