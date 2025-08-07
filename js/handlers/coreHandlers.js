// js/handlers/coreHandlers.js

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');

  if (!dot || !menu) return;

  let isOpen = false;

  // Открытие/закрытие меню по клику на точку
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
  });

  // Закрытие меню при клике вне области меню и точки
  document.addEventListener('click', (e) => {
    if (
      isOpen &&
      !menu.contains(e.target) &&
      !dot.contains(e.target)
    ) {
      isOpen = false;
      menu.classList.remove('open');
    }
  });

  // Опционально: ESC закрывает меню
  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === "Escape") {
      isOpen = false;
      menu.classList.remove('open');
    }
  });
}

// Можно вызвать setupDotCoreMenu() в main.js или ui/core.js после DOMContentLoaded
