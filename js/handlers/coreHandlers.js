// js/handlers/coreHandlers.js

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');

  if (!dot || !menu) return;

  let isOpen = false;

  // === Исправлено: позиционирование меню через rAF ===
  function positionMenu() {
    menu.style.display = "flex";
    menu.style.visibility = "hidden";

    requestAnimationFrame(() => {
      const dotRect = dot.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();

      // Центр под капсулой
      let left = dotRect.left + dotRect.width / 2 - menuRect.width / 2;
      let top = dotRect.bottom + 8;

      const padding = 8;

      if (left < padding) left = padding;
      if (left + menuRect.width > window.innerWidth - padding)
        left = window.innerWidth - menuRect.width - padding;

      if (top + menuRect.height > window.innerHeight - padding)
        top = dotRect.top - menuRect.height - 8;

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.style.position = "fixed";
      menu.style.visibility = "visible";
      menu.style.zIndex = "99999";
    });
  }

  // Открытие/закрытие меню
  dot.addEventListener('click', (e) => {
    if (document.body.classList.contains('dragging-dotcore')) return;
    e.stopPropagation();
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);

    if (isOpen) {
      positionMenu();
    } else {
      resetMenuStyles();
    }
  });

  // Обновление позиции при resize/scroll
  window.addEventListener('resize', () => { if (isOpen) positionMenu(); });
  window.addEventListener('scroll', () => { if (isOpen) positionMenu(); });

  // Закрытие по клику вне
  document.addEventListener('click', (e) => {
    if (
      isOpen &&
      !menu.contains(e.target) &&
      !dot.contains(e.target)
    ) {
      isOpen = false;
      menu.classList.remove('open');
      resetMenuStyles();
    }
  });

  // Закрытие по ESC
  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === "Escape") {
      isOpen = false;
      menu.classList.remove('open');
      resetMenuStyles();
    }
  });

  function resetMenuStyles() {
    menu.style.display = "";
    menu.style.left = "";
    menu.style.top = "";
    menu.style.position = "";
    menu.style.visibility = "";
    menu.style.zIndex = "";
  }
}