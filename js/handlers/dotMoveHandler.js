// js/handlers/dotMoveHandler.js
// Перемещение .dot-core в нижнюю панель при фокусе на инпуте.
// DOT располагается справа (управляется через CSS-сетку bottom-panel).

export function setupDotMoveOnInput() {
  const dot = document.querySelector('.dot-core');
  const bottomPanel = document.querySelector('.bottom-panel');
  const topbar = document.querySelector('.topbar');
  if (!dot || !bottomPanel || !topbar) return;

  ensureBottomActions(bottomPanel);

  let lastDotParent = null;

  // При фокусе на поле ввода — переносим DOT в панель
  bottomPanel.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('chat-input')) {
      if (!bottomPanel.contains(dot)) {
        lastDotParent = dot.parentElement;
        bottomPanel.appendChild(dot);

        // Сброс координат после драга, чтобы корректно встать в грид
        dot.style.position = '';
        dot.style.left = '';
        dot.style.top = '';
        dot.style.transform = 'translate3d(0,0,0)';
      }
    }
  });

  // Возврат DOT, когда фокус уходит из панели полностью
  bottomPanel.addEventListener('focusout', () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!bottomPanel.contains(active) && lastDotParent && !lastDotParent.contains(dot)) {
        lastDotParent.appendChild(dot);
      }
    }, 0);
  });

  // Клик по DOT = отправка (как было)
  dot.addEventListener('click', () => {
    if (!bottomPanel.contains(dot)) return;
    const input = bottomPanel.querySelector('.chat-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    window.dispatchEvent(new CustomEvent('dot:sendMessage', { detail: { text } }));
    input.value = '';
    input.focus();
  });

  // Плюс — триггер события наружу
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