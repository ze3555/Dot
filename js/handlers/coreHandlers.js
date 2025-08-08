// js/handlers/coreHandlers.js
// Центр управления dot-меню (классическая схема).
// Меню: .dot-core-menu (fixed), скрыто без класса .open.
// Клик по DOT (если не в доке) — toggle меню. Клик вне / Esc / скролл / ресайз — закрыть.

export function initCoreHandlers() {
  const dot = document.querySelector('.dot-core');
  const menu = document.querySelector('.dot-core-menu');
  if (!dot || !menu) return;

  // Глушим все остаточные "мини-окна", если они где-то лежат
  document.querySelectorAll('.dot-mini').forEach(el => el.remove());

  const bottomPanel = document.querySelector('.bottom-panel');
  const isDockedInBottom = () => bottomPanel && bottomPanel.contains(dot);

  // --- API ---
  const openMenu = () => {
    if (menu.classList.contains('open')) return;
    menu.classList.add('open');
    positionMenu();
    // слушатели для автозакрытия/репозиционирования
    window.addEventListener('pointerdown', onDocPointerDown, true);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange, { passive: true });
  };

  const closeMenu = () => {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    window.removeEventListener('pointerdown', onDocPointerDown, true);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('scroll', onViewportChange);
    window.removeEventListener('resize', onViewportChange);
  };

  const toggleMenu = () => (menu.classList.contains('open') ? closeMenu() : openMenu());

  function onDocPointerDown(e) {
    if (!menu.classList.contains('open')) return;
    if (menu.contains(e.target)) return;
    if (dot.contains(e.target)) return;
    closeMenu();
  }
  function onKeyDown(e) { if (e.key === 'Escape') closeMenu(); }
  function onViewportChange() { if (menu.classList.contains('open')) positionMenu(); }

  // Позиционирование фиксированного меню около точки
  function positionMenu() {
    const d = dot.getBoundingClientRect();
    // временно делаем видимым для измерений
    menu.style.visibility = 'hidden';
    menu.style.left = '0px'; menu.style.top = '0px';
    const m = menu.getBoundingClientRect();

    const GAP = 10;
    let top = d.bottom + GAP;     // дефолт — под точкой
    let left = d.right - m.width; // прижимаем правым краем к точке

    // флип вверх, если не влазит снизу
    if (top + m.height > window.innerHeight - 8) top = d.top - m.height - GAP;
    // корректируем влево/вправо по краям
    if (left < 8) left = 8;
    const maxLeft = window.innerWidth - m.width - 8;
    if (left > maxLeft) left = maxLeft;

    menu.style.left = Math.round(left) + 'px';
    menu.style.top  = Math.round(top)  + 'px';
    menu.style.visibility = '';
  }

  // === Обработчики ===

  // Клик по DOT открывает/закрывает меню (кроме дока)
  dot.addEventListener('click', () => {
    if (isDockedInBottom()) return; // в доке — отправка, не трогаем
    toggleMenu();
  });

  // Клик по пунктам меню — закрыть и отдать действие наружу
  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('button, [role="menuitem"], a, [data-action]');
    if (!btn) return;
    closeMenu();
    const action = (btn.dataset.action || btn.textContent || '').trim().toLowerCase();

    if (action === 'contacts') {
      // Спец-кейс проекта: открыть режим контактов (обрабатывается снаружи)
      window.dispatchEvent(new CustomEvent('dot:openContacts'));
      return;
    }
    window.dispatchEvent(new CustomEvent('dot:menuAction', { detail: { action } }));
  });

  // На старте — меню закрыто
  closeMenu();
}