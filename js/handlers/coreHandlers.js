// js/handlers/coreHandlers.js

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');

  if (!dot || !menu) return;

  let isOpen = false;

  // === Новая функция: позиционирование меню возле DotCore ===
  function positionMenu() {
    menu.style.display = "flex";
    menu.style.visibility = "hidden";

    const dotRect = dot.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    // По умолчанию — снизу и по центру DotCore
    let left = dotRect.left + dotRect.width / 2 - menuRect.width / 2;
    let top = dotRect.bottom + 8;

    // Коррекция: если не влезает справа/слева
    const padding = 8;
    if (left < padding) left = padding;
    if (left + menuRect.width > window.innerWidth - padding)
      left = window.innerWidth - menuRect.width - padding;
    // Если не влезает вниз — показываем меню выше DotCore
    if (top + menuRect.height > window.innerHeight - padding)
      top = dotRect.top - menuRect.height - 8;

    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.position = "fixed";
    menu.style.visibility = "visible";
    menu.style.zIndex = 99999;
  }

  // Открытие/закрытие меню по клику на точку
  dot.addEventListener('click', (e) => {
    if (document.body.classList.contains('dragging-dotcore')) return; // Блокировка во время drag
    e.stopPropagation();
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    if (isOpen) {
      positionMenu();
    } else {
      menu.style.display = "";
      menu.style.left = "";
      menu.style.top = "";
      menu.style.position = "";
      menu.style.visibility = "";
      menu.style.zIndex = "";
    }
  });

  // Перепозиционировать меню при изменении окна/скролле
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