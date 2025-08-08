// js/handlers/dotMoveHandler.js
// DOT докуется в нижнюю панель при фокусе на инпуте и возвращается:
//  – при расфокусе — в сохранённую плавающую позицию,
//  – при двойном клике — на топбар.
// Плюс: мгновенный апдейт автоконтраста при каждом перемещении между зонами.

export function setupDotMoveOnInput() {
  const dot = document.querySelector('.dot-core');
  const bottomPanel = document.querySelector('.bottom-panel');
  const topbar = document.querySelector('.topbar');
  if (!dot || !bottomPanel || !topbar) return;

  ensureBottomActions(bottomPanel);

  let floatState = { parent: null, left: 0, top: 0, has: false };
  let homeMode = false;

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
      updateDotContrast(dot);
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
    updateDotContrast(dot);
  }

  // Док при фокусе
  bottomPanel.addEventListener('focusin', (e) => {
    if (!e.target.classList.contains('chat-input')) return;

    captureFloatState();
    if (!bottomPanel.contains(dot)) {
      bottomPanel.appendChild(dot);
    }
    dot.style.position = '';
    dot.style.left = '';
    dot.style.top = '';
    dot.style.transform = 'translate3d(0,0,0)';
    updateDotContrast(dot);
  });

  // Возврат при расфокусе всей панели
  bottomPanel.addEventListener('focusout', () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (bottomPanel.contains(active)) return;
      if (homeMode) {
        undockToTopbar();
      } else {
        undockToFloat();
      }
    }, 0);
  });

  // Клик по DOT в доке — отправка
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

  // Плюс — наружу событие
  bottomPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('#add-folder-btn');
    if (!btn) return;
    window.dispatchEvent(new CustomEvent('dot:addFolder'));
  });

  // Управление режимами
  dot.addEventListener('pointerdown', () => { homeMode = false; }, { passive: true });

  dot.addEventListener('dblclick', () => {
    homeMode = true;
    undockToTopbar();
  });

  // ===== Мини-копия автоконтраста для событий док/ан-док (то же правило ч/б) =====
  function updateDotContrast(dotEl) {
    const rect = dotEl.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);

    const prevPE = dotEl.style.pointerEvents;
    dotEl.style.pointerEvents = 'none';
    let behind = document.elementFromPoint(cx, cy);
    dotEl.style.pointerEvents = prevPE;

    let rgba = null;
    let guard = 0;
    while (behind && guard++ < 20) {
      const bg = getComputedStyle(behind).backgroundColor;
      const parsed = parseCssColor(bg);
      if (parsed && parsed[3] > 0) { rgba = parsed; break; }
      behind = behind.parentElement;
    }
    if (!rgba) rgba = [255,255,255,1];

    const [r,g,b,a] = rgba;
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    const hex = lum < 0.5 ? '#fff' : '#000';

    dotEl.style.color = hex;
    dotEl.style.setProperty('--dot-core-fg', hex);
    dotEl.style.setProperty('--dot-core-border', hex);

    try {
      dotEl.querySelectorAll('svg').forEach(svg => {
        svg.style.stroke = 'currentColor';
        svg.style.fill = 'currentColor';
      });
    } catch(_) {}
  }

  function srgb(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }
  function parseCssColor(color) {
    if (!color) return null;
    if (color === 'transparent') return [0,0,0,0];
    if (color.startsWith('rgb')) {
      const m = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+(?:\.\d+)?))?\)/i);
      if (!m) return null;
      return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10), m[4] ? parseFloat(m[4]) : 1];
    }
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      if (hex.length !== 6) return null;
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);
      return [r,g,b,1];
    }
    return null;
  }

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