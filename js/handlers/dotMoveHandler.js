// js/handlers/dotMoveHandler.js
// Докование DOT в нижнюю панель при фокусе инпута и возврат:
//  • при расфокусе — в сохранённую плавающую позицию,
//  • при dblclick — домой в топбар.
// Одиночный клик в доке — отправка сообщения.

export function setupDotMoveOnInput() {
  const dot = document.querySelector('.dot-core');
  const bottomPanel = document.querySelector('.bottom-panel');
  const topbar = document.querySelector('.topbar');
  if (!dot || !bottomPanel || !topbar) return;

  ensureBottomActions(bottomPanel);

  // где DOT был до докования (чтобы вернуть)
  let floatState = { parent: null, left: 0, top: 0, has: false };
  // "домой" режим
  let homeMode = false;

  function captureFloatState() {
    const rect = dot.getBoundingClientRect();
    floatState = { parent: dot.parentElement, left: rect.left, top: rect.top, has: true };
  }

  function undockToFloat() {
    if (floatState.has) {
      if (!floatState.parent.contains(dot)) floatState.parent.appendChild(dot);
      dot.style.position = 'fixed';
      dot.style.left = floatState.left + 'px';
      dot.style.top  = floatState.top + 'px';
      dot.style.transform = 'translate3d(0,0,0)';
    } else {
      undockToTopbar();
    }
  }

  function undockToTopbar() {
    if (!topbar.contains(dot)) topbar.appendChild(dot);
    dot.style.position = '';
    dot.style.left = '';
    dot.style.top = '';
    dot.style.transform = 'translate3d(0,0,0)';
  }

  // Док при фокусе на инпуте
  bottomPanel.addEventListener('focusin', (e) => {
    if (!e.target.classList.contains('chat-input')) return;
    captureFloatState();
    if (!bottomPanel.contains(dot)) bottomPanel.appendChild(dot);
    // сброс фикс-координат, чтобы стать в грид
    dot.style.position = '';
    dot.style.left = '';
    dot.style.top = '';
    dot.style.transform = 'translate3d(0,0,0)';
  });

  // Возврат при потере фокуса панели
  bottomPanel.addEventListener('focusout', () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (bottomPanel.contains(active)) return;
      if (homeMode) undockToTopbar(); else undockToFloat();
    }, 0);
  });

  // Клик в доке — отправка
  dot.addEventListener('click', () => {
    if (!bottomPanel.contains(dot)) return;
    const input = bottomPanel.querySelector('.chat-input');
    if (!input) return;
    const text = (input.value || '').trim();
    if (!text) return;
    window.dispatchEvent(new CustomEvent('dot:sendMessage', { detail: { text } }));
    input.value = '';
    input.focus();
  });

  // Любое ручное взаимодействие выводит из homeMode
  dot.addEventListener('pointerdown', () => { homeMode = false; }, { passive: true });

  // Двойной клик — вернуть домой (в топбар)
  dot.addEventListener('dblclick', () => {
    homeMode = true;
    undockToTopbar();
  });

  // Плюсик под инпутом — наружу событие
  bottomPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('#add-folder-btn');
    if (btn) window.dispatchEvent(new CustomEvent('dot:addFolder'));
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