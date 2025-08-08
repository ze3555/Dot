// js/handlers/dotMoveHandler.js
// DOT: док в нижнюю панель при фокусе, возврат в прежнюю плавающую позицию при расфокусе,
// двойной клик — вернуть в топбар. Отправка сообщения по клику на DOT в доке — без изменений.

export function setupDotMoveOnInput() {
  const dot = document.querySelector('.dot-core');
  const bottomPanel = document.querySelector('.bottom-panel');
  const topbar = document.querySelector('.topbar');
  if (!dot || !bottomPanel || !topbar) return;

  ensureBottomActions(bottomPanel);

  // Сохраняем "плавающее" состояние до докования (куда вернуть после расфокуса)
  let floatState = { parent: null, left: 0, top: 0, has: false };

  // Режим "домой в топбар" (включается даблкликом)
  let homeMode = false;

  // --- helpers ---
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
      // Фоллбек: если нет floatState — вернем в топбар
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

  // --- докование при фокусе на инпуте ---
  bottomPanel.addEventListener('focusin', (e) => {
    if (!e.target.classList.contains('chat-input')) return;

    // Запоминаем текущую плавающую позицию, чтобы вернуть её после расфокуса
    captureFloatState();

    if (!bottomPanel.contains(dot)) {
      bottomPanel.appendChild(dot);
    }
    // В доке позиционируемся через CSS-грid, сбрасываем фикс-позицию
    dot.style.position = '';
    dot.style.left = '';
    dot.style.top = '';
    dot.style.transform = 'translate3d(0,0,0)';
  });

  // --- возврат из дока при потере фокуса всей панели ---
  bottomPanel.addEventListener('focusout', () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (bottomPanel.contains(active)) return; // фокус ушел, но все еще внутри панели

      if (homeMode) {
        undockToTopbar();
      } else {
        undockToFloat();
      }
    }, 0);
  });

  // --- клик по DOT в доке = отправка ---
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

  // --- плюс под инпутом ---
  bottomPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('#add-folder-btn');
    if (!btn) return;
    window.dispatchEvent(new CustomEvent('dot:addFolder'));
  });

  // --- управление режимами ---
  // Любое "ручное" взаимодействие (drag стартует с pointerdown) — выходим из homeMode
  dot.addEventListener('pointerdown', () => { homeMode = false; }, { passive: true });

  // Двойной клик — вернуть домой в топбар
  dot.addEventListener('dblclick', () => {
    homeMode = true;
    undockToTopbar();
  });

  // UI-инфраструктура нижней панели (если ещё не создана)
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