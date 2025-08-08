// js/handlers/coreHandlers.js
// Центральный контроллер DOT:
//  • Без выпадающего меню — двойной тап/клик открывает компактное мини-окно (2 кнопки)
//  • В доке (нижняя панель) одиночный клик = отправка (см. dotMoveHandler: антидребезг 220мс)
//  • Закрытие мини-окна: клик вне, Esc, скролл, ресайз, начало драга
//  • Хайдим любые legacy .dot-menu/.dot-core-menu

export function initCoreHandlers() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  // Глушим любые старые меню, если они вдруг остались
  document.querySelectorAll('.dot-menu, .dot-core-menu').forEach(el => {
    el.classList?.add('ClassHidden');
    el.style.display = 'none';
  });

  const bottomPanel = document.querySelector('.bottom-panel');
  const isDockedInBottom = () => bottomPanel && bottomPanel.contains(dot);

  // ---- Мини-окно (2 кнопки) ----
  const MINI_ACTIONS = [
    { label: 'Function', action: 'function' },
    { label: 'Theme',    action: 'theme' },
  ];

  let mini = null;
  let isOpen = false;

  function ensureMini() {
    if (mini) return mini;
    mini = document.createElement('div');
    mini.className = 'dot-mini ClassHidden';
    mini.innerHTML = `
      <div class="dot-mini__content">
        ${MINI_ACTIONS.map(a => `
          <button type="button" class="dot-mini__btn" data-action="${a.action}">${a.label}</button>
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

  function onKeyDown(e) { if (e.key === 'Escape') closeMini(); }

  function onDocPointerDown(e) {
    if (!isOpen) return;
    const insideMini = mini.contains(e.target);
    const insideDot  = dot.contains(e.target);
    if (!insideMini && !insideDot) closeMini();
  }

  function onResize() { if (isOpen) positionMini(); }

  function positionMini() {
    if (!mini) return;
    const d = dot.getBoundingClientRect();

    // Показать вне экрана, измерить
    mini.style.visibility = 'hidden';
    mini.style.left = '0px';
    mini.style.top = '0px';
    const m = mini.getBoundingClientRect();

    const gap = 8;
    let top = d.top - m.height - gap;   // сверху по умолчанию
    let left = d.right - m.width;       // правым краем к DOT

    if (top < 8) top = d.bottom + gap;  // флип вниз
    if (left < 8) left = 8;
    const maxLeft = window.innerWidth - m.width - 8;
    if (left > maxLeft) left = maxLeft;

    mini.style.transform = 'none';
    mini.style.left = `${Math.round(left)}px`;
    mini.style.top  = `${Math.round(top)}px`;
    mini.style.visibility = '';
  }

  // ---- Двойной тап/клик ----
  // Desktop: нативный dblclick
  dot.addEventListener('dblclick', (e) => {
    e.preventDefault();
    // Если дабл-тап случился в доке — отменим pending send
    if (isDockedInBottom()) {
      window.dispatchEvent(new CustomEvent('dot:cancelPendingSend'));
    }
    if (isOpen) closeMini(); else openMini();
  });

  // Mobile: свой double-tap детектор на touch-пойнтерах
  let lastTapT = 0, lastTapX = 0, lastTapY = 0, tapPtrId = null;
  const DOUBLE_MS = 260, DOUBLE_DIST2 = 18*18;

  dot.addEventListener('pointerdown', (e) => {
    // Если мини уже открыто и юзер начинает новый жест — закроем
    if (isOpen) closeMini();

    if (e.pointerType !== 'touch') return; // мышь/стилус — оставим dblclick
    const now = performance.now();
    const dx = e.clientX - lastTapX;
    const dy = e.clientY - lastTapY;
    const dist2 = dx*dx + dy*dy;

    if ((now - lastTapT) < DOUBLE_MS && dist2 < DOUBLE_DIST2) {
      // double-tap
      e.preventDefault();
      tapPtrId = null;
      lastTapT = 0;
      // отменить возможную отправку по одиночному клику в доке
      if (isDockedInBottom()) {
        window.dispatchEvent(new CustomEvent('dot:cancelPendingSend'));
      }
      if (isOpen) closeMini(); else openMini();
    } else {
      lastTapT = now;
      lastTapX = e.clientX;
      lastTapY = e.clientY;
      tapPtrId = e.pointerId;
    }
  }, { passive: false });

  // Страховка: если начали перетаскивание — закрыть мини-окно
  dot.addEventListener('pointermove', () => { if (isOpen) closeMini(); }, { passive: true });

  // Если DOT уехал в док/вернулся — мини-окно не должно оставаться висеть
  if (bottomPanel) {
    bottomPanel.addEventListener('focusin', () => { if (isOpen) closeMini(); });
    bottomPanel.addEventListener('focusout', () => { if (isOpen) closeMini(); });
  }
}