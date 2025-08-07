// js/handlers/coreHandlers.js

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');

  if (!dot || !menu) return;

  let isOpen = false;

  // === Новая функция: позиционирование меню возле DotCore ===
  function positionMenu() {
    // Временно показать меню, чтобы получить размеры
    menu.style.display = "flex";
    menu.style.visibility = "hidden";

    const dotRect = dot.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    // Снизу и по центру относительно DotCore
    let left = dotRect.left + dotRect.width / 2 - menuRect.width / 2;
    let top = dotRect.bottom + 8;

    // Корректируем, если вылезает за границы
    const padding = 8;
    if (left < padding) left = padding;
    if (left + menuRect.width > window.innerWidth - padding)
      left = window.innerWidth - menuRect.width - padding;
    if (top + menuRect.height > window.innerHeight - padding)
      top = dotRect.top - menuRect.height - 8; // открыть вверх, если снизу не влезает

    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.position = "fixed";
    menu.style.visibility = "visible";
    menu.style.zIndex = 99999;
  }

  // Открытие/закрытие меню по клику на точку
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    if (isOpen) {
      positionMenu();
    } else {
      // Чистим стили при закрытии
      menu.style.display = "";
      menu.style.left = "";
      menu.style.top = "";
      menu.style.position = "";
      menu.style.visibility = "";
      menu.style.zIndex = "";
    }
  });

  // Перепозиционировать меню при изменении окна
  window.addEventListener('resize', () => { if (isOpen) positionMenu(); });
  window.addEventListener('scroll', () => { if (isOpen) positionMenu(); });

  // Закрытие меню при клике вне области меню и точки
  document.addEventListener('click', (e) => {
    if (
      isOpen &&
      !menu.contains(e.target) &&
      !dot.contains(e.target)
    ) {
      isOpen = false;
      menu.classList.remove('open');
      menu.style.display = "";
      menu.style.left = "";
      menu.style.top = "";
      menu.style.position = "";
      menu.style.visibility = "";
      menu.style.zIndex = "";
    }
  });

  // Опционально: ESC закрывает меню
  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === "Escape") {
      isOpen = false;
      menu.classList.remove('open');
      menu.style.display = "";
      menu.style.left = "";
      menu.style.top = "";
      menu.style.position = "";
      menu.style.visibility = "";
      menu.style.zIndex = "";
    }
  });
}

// Можно вызвать setupDotCoreMenu() в main.js или ui/core.js после DOMContentLoaded