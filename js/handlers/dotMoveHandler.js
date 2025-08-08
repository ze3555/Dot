// js/handlers/dotMoveHandler.js
// Перемещение .dot-core в нижнюю панель при фокусе на инпуте,
// возврат в сохранённую плавающую позицию при расфокусе,
// одинарный клик в доке — отправка сообщения,
// ДВОЙНОЙ клик НЕ возвращает в топбар (этим теперь занимается coreHandlers: мини-окно).

export function setupDotMoveOnInput() {
  const dot = document.querySelector('.dot-core');
  const bottomPanel = document.querySelector('.bottom-panel');
  const topbar = document.querySelector('.topbar');
  if (!dot || !bottomPanel || !topbar) return;

  ensureBottomActions(bottomPanel);

  // Сохраняем "плавающую" позицию, чтобы вернуть после дока
  let floatState = { parent: null, left: 0, top: 0, has: false };

  function captureFloatState() {
    const rect = dot.getBoundingClientRect();
    floatState = {
      parent: dot.parentElement,
      left: rect.left,
      top: rect.top,
      has: true
    };
  }

  function undockToFloat() {
    if (floatState.has) {
      if (!floatState.parent.contains(dot)) {
        floatState.parent.appendChild(dot);
      }
      dot.style.position = 'fixed';
      dot.style.left = floatState.left + 'px';
      dot.style.top = floatState.top + 'px';
      dot.style.transform = 'translate3d(0,0,0)';
    } else {
      // если нет сохранённой позиции, вернём в топбар
      if (!topbar.contains(dot)) topbar.appendChild(dot);
      dot.style.position = '';
      dot.style.left = '';
      dot.style.top = '';
      dot.style.transform = 'translate3d(0,0,0)';
    }
  }

  // Док при фокусе на инпуте
  bottomPanel.addEventListener('focusin', (e) => {
    if (!e.target.classList.contains('chat-input')) return;

    captureFloatState();

    if (!bottomPanel.contains(dot)) {
      bottomPanel.appendChild(dot);
    }

    // Сбросим фикс-позиции для корректного грид-расклада
    dot.style.position = '';
    dot.style.left = '';
    dot.style.top = '';
    dot.style.transform = 'translate3d(0,0,0)';
  });

  // Возврат из дока при потере фокуса всей панели
  bottomPanel.addEventListener('focusout', () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (bottomPanel.contains(active)) return; // фокус всё ещё внутри
      undockToFloat();
    }, 0);
  });

  // Клик по DOT в доке = отправка; игнорируем двойные клики (чтобы не конфликтовать с мини-окном)
  dot.addEventListener('click', (e) => {
    if (e.detail > 1) return;                 // часть двойного клика — пропускаем
    if (!bottomPanel.contains(dot)) return;    // только в доке

    const input = bottomPanel.querySelector('.chat-input');
    if (!input) return;

    const text = (input.value || '').trim();
    if (!text) return;

    window.dispatchEvent(new CustomEvent('dot:sendMessage', { detail: { text } }));
    input.value = '';
    input.focus();
  });

  // Плюс под инпутом — наружу событие
  bottomPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('#add-folder-btn');
    if (!btn) return;
    window.dispatchEvent(new CustomEvent('dot:addFolder'));
  });

  // Инфраструктура панели
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