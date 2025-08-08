// js/handlers/dotMoveHandler.js
// Докование DOT в нижнюю панель при фокусе инпута и возврат в сохранённую позицию.
// Одиночный клик в доке — отправка (с антидребезгом 220мс, чтобы не мешать double-tap из coreHandlers).
// Двойной клик больше НЕ "домой" — мини-окно открывает coreHandlers.

export function setupDotMoveOnInput() {
  const dot = document.querySelector('.dot-core');
  const bottomPanel = document.querySelector('.bottom-panel');
  const topbar = document.querySelector('.topbar');
  if (!dot || !bottomPanel || !topbar) return;

  ensureBottomActions(bottomPanel);

  // Сохранённая "плавающая" позиция (куда вернуть после дока)
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
      // fallback — в топбар
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
    if (!bottomPanel.contains(dot)) bottomPanel.appendChild(dot);
    // Сброс фикс-позиций для грида
    dot.style.position = '';
    dot.style.left = '';
    dot.style.top = '';
    dot.style.transform = 'translate3d(0,0,0)';
  });

  // Возврат из дока при потере фокуса всей панели
  bottomPanel.addEventListener('focusout', () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (bottomPanel.contains(active)) return;
      undockToFloat();
    }, 0);
  });

  // ---- Отправка по клику в доке с антидребезгом (ждем, не случился ли double-tap) ----
  let sendTimer = null;
  const SEND_DELAY = 220; // мс; синхронизировано с coreHandlers DOUBLE_MS

  function trySendFromDock() {
    if (!bottomPanel.contains(dot)) return;
    const input = bottomPanel.querySelector('.chat-input');
    if (!input) return;
    const text = (input.value || '').trim();
    if (!text) return;
    window.dispatchEvent(new CustomEvent('dot:sendMessage', { detail: { text } }));
    input.value = '';
    input.focus();
  }

  // Клик по DOT (только в доке) — ставим таймер
  dot.addEventListener('click', () => {
    if (!bottomPanel.contains(dot)) return;
    clearTimeout(sendTimer);
    sendTimer = setTimeout(() => { trySendFromDock(); sendTimer = null; }, SEND_DELAY);
  });

  // Если coreHandlers распознал double-tap — отменяем pending send
  window.addEventListener('dot:cancelPendingSend', () => {
    if (sendTimer) {
      clearTimeout(sendTimer);
      sendTimer = null;
    }
  });

  // Страховки: любой уход фокуса/уход из панели/начало драга — отменить pending send
  bottomPanel.addEventListener('focusout', () => { if (sendTimer) { clearTimeout(sendTimer); sendTimer = null; } });
  dot.addEventListener('pointerdown', () => { if (sendTimer) { clearTimeout(sendTimer); sendTimer = null; } }, { passive: true });

  // Инфраструктура нижней панели (плюс под инпутом)
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