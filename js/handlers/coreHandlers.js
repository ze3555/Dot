// js/handlers/coreHandlers.js

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');

  if (!dot || !menu) return;

  let isOpen = false;

  // === Позиционирование меню возле DotCore ===
  function positionMenu() {
    menu.style.display = "flex";
    menu.style.visibility = "hidden";

    const dotRect = dot.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    let left = dotRect.left + dotRect.width / 2 - menuRect.width / 2;
    let top = dotRect.bottom + 8;

    const padding = 8;
    if (left < padding) left = padding;
    if (left + menuRect.width > window.innerWidth - padding)
      left = window.innerWidth - menuRect.width - padding;
    if (top + menuRect.height > window.innerHeight - padding)
      top = dotRect.top - menuRect.height - 8;

    menu.style.left = left + "px";
    menu.style.top = top + "px";
    menu.style.position = "fixed";
    menu.style.visibility = "visible";
    menu.style.zIndex = 99999;
  }

  function closeMenu() {
    isOpen = false;
    menu.classList.remove('open');
    menu.style.display = "";
    menu.style.left = "";
    menu.style.top = "";
    menu.style.position = "";
    menu.style.visibility = "";
    menu.style.zIndex = "";
  }

  // Клик по точке DOT
  dot.addEventListener('click', (e) => {
    if (document.body.classList.contains('dragging-dotcore')) return;
    e.stopPropagation();
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    if (isOpen) {
      positionMenu();
    } else {
      closeMenu();
    }
  });

  // Закрытие меню по клику вне
  document.addEventListener('click', (e) => {
    if (
      isOpen &&
      !menu.contains(e.target) &&
      !dot.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // ESC закрывает меню
  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && isOpen) {
      closeMenu();
    }
  });

  // Клик на любой пункт меню — закрыть меню
  menu.addEventListener('click', (e) => {
    if (e.target.closest('button')) closeMenu();
  });

  // Перепозиционировать при ресайзе/скролле
  window.addEventListener('resize', () => { if (isOpen) positionMenu(); });
  window.addEventListener('scroll', () => { if (isOpen) positionMenu(); });
}