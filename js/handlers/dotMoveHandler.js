// js/handlers/dotMoveHandler.js
// Перемещение .dot-core в нижнюю панель при фокусе на инпуте
// + узкая строка действий с плюсом под инпутом (без изменения остальной логики)

export function setupDotMoveOnInput() {
  const dot = document.querySelector('.dot-core');
  const bottomPanel = document.querySelector('.bottom-panel');
  const topbar = document.querySelector('.topbar');
  if (!dot || !bottomPanel || !topbar) return;

  // Гарантируем, что в нижней панели есть слой действий с плюсом
  ensureBottomActions(bottomPanel);

  let lastDotParent = null;

  // При фокусе на поле ввода — переносим dot вниз
  bottomPanel.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('chat-input')) {
      if (!bottomPanel.contains(dot)) {
        lastDotParent = dot.parentElement;
        bottomPanel.appendChild(dot);

        // Сбрасываем возможные фикс-позиции после драга
        dot.style.position = '';
        dot.style.left = '';
        dot.style.top = '';
        dot.style.transform = 'translate3d(0,0,0)';
      }
    }
  });

  // Возврат dot на место, когда фокус уходит из панели полностью
  bottomPanel.addEventListener('focusout', () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!bottomPanel.contains(active) && lastDotParent && !lastDotParent.contains(dot)) {
        lastDotParent.appendChild(dot);
      }
    }, 0);
  });

  // Клик по dot как "отправка" (поведение как было)
  dot.addEventListener('click', () => {
    if (!bottomPanel.contains(dot)) return;
    const input = bottomPanel.querySelector('.chat-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    // Ничего в бэкенде не меняем — выбрасываем событие наружу
    window.dispatchEvent(new CustomEvent('dot:sendMessage', { detail: { text } }));
    input.value = '';
    input.focus();
  });

  // Кнопка "папка" (плюс) — событие наружу, без привязки к реализации
  bottomPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('#add-folder-btn');
    if (!btn) return;
    window.dispatchEvent(new CustomEvent('dot:addFolder'));
  });

  function ensureBottomActions(panel) {
    let actions = panel.querySelector('.bottom-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'bottom-actions';
      actions.innerHTML = `
        <div class="left-actions">
          <button type="button" id="add-folder-btn" class="add-folder-btn" aria-label="Add chat folder" title="New folder">+</button>
        </div>
        <div class="right-actions"></div>
      `;
      panel.appendChild(actions);
    }
  }
}