// js/handlers/coreHandlers.js
// Мини-окно с двумя кнопками по двойному тапу на .dot-core.
// Никаких выпадающих меню. Окно закрывается по клику вне/по кнопке/ESC/скроллу/ресайзу.

export function initCoreHandlers() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  // На всякий случай прячем старые меню, если остались в DOM
  document.querySelectorAll('.dot-menu, .dot-core-menu').forEach(el => {
    el.classList?.add('ClassHidden');
    el.style.display = 'none';
  });

  // Конфиг двух кнопок мини-окна (можешь поменять лейблы/экшены)
  const MINI_ACTIONS = [
    { label: 'Function', action: 'function' },
    { label: 'Theme',    action: 'theme' },
  ];

  // --- мини-окно (singleton) ---
  let mini = null;
  let isOpen = false;

  function ensureMini() {
    if (mini) return mini;
    mini = document.createElement('div');
    mini.className = 'dot-mini ClassHidden';
    mini.innerHTML = `
      <div class="dot-mini__content">
        ${MINI_ACTIONS.map(a => `
          <button type="button" class="dot-mini__btn" data-action="${a.action}">
            ${a.label}
          </button>
        `).join('')}
      </div>
    `;
    document.body.appendChild(mini);

    // Клики по кнопкам
    mini.addEventListener('click', (e) => {
      const btn = e.target.closest('.dot-mini__btn');
      if (!btn) return;
      const action = btn.dataset.action;
      closeMini();
      window.dispatchEvent(new CustomEvent('dot:miniAction', { detail: { action } }));
    });

    return mini;
  }

  function openMini() {
    const el = ensureMini();
    el.classList.remove('ClassHidden');
    isOpen = true;
    positionMini();

    // Глобальные слушатели для автозакрытия
    window.addEventListener('pointerdown', onDocPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', closeMiniPassive, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
  }

  function closeMini() {
    if (!mini) return;
    mini.classList.add('ClassHidden');
    isOpen = false;

    window.removeEventListener('pointerdown', onDocPointerDown, true);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('scroll', closeMiniPassive);
    window.removeEventListener('resize', onResize);
  }

  function closeMiniPassive() { closeMini(); }

  function onKeyDown(e) {
    if (e.key === 'Escape') closeMini();
  }

  function onDocPointerDown(e) {
    if (!isOpen) return;
    const insideMini = mini.contains(e.target);
    const insideDot  = dot.contains(e.target);
    if (!insideMini && !insideDot) closeMini();
  }

  function onResize() {
    if (!isOpen) return;
    positionMini();
  }

  function positionMini() {
    if (!mini) return;
    const d = dot.getBoundingClientRect();

    // сначала делаем видимым, чтобы измерить
    mini.style.visibility = 'hidden';
    mini.style.left = '0px';
    mini.style.top = '0px';

    // форс-лейаут
    const m = mini.getBoundingClientRect();

    // Параметры
    const gap = 8;
    let top = d.top - m.height - gap;    // по умолчанию — над точкой
    let left = d.right - m.width;        // прижимаем правый край к точке

    // Флипы, если не влазит
    if (top < 8) top = d.bottom + gap;   // вниз
    if (left < 8) left = 8;
    const maxLeft = window.innerWidth - m.width - 8;
    if (left > maxLeft) left = maxLeft;

    mini.style.transform = 'none';
    mini.style.left = `${Math.round(left)}px`;
    mini.style.top  = `${Math.round(top)}px`;
    mini.style.visibility = '';
  }

  // --- события DOT ---
  // Двойной тап открывает мини-окно
  dot.addEventListener('dblclick', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) closeMini(); else openMini();
  });

  // Если DOT перемещают/таскают — лучше закрыть окно
  dot.addEventListener('pointerdown', () => { if (isOpen) closeMini(); }, { passive: true });
}