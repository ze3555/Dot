// js/handlers/coreHandlers.js

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');
  if (!dot || !menu) return;

  // Защита от повторной инициализации
  if (menu.dataset.initialized) return;
  menu.dataset.initialized = "true";

  let isOpen = false;

  function positionMenu() {
    // Убедимся, что меню временно видно для измерения
    menu.style.display = "flex";
    menu.style.opacity = "0";
    menu.style.pointerEvents = "none";

    requestAnimationFrame(() => {
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

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.style.position = "fixed";
      menu.style.opacity = "1";
      menu.style.pointerEvents = "auto";
      menu.style.zIndex = "99999";
    });
  }

  function openMenu() {
    isOpen = true;
    menu.classList.add("open");
    positionMenu();
  }

  function closeMenu() {
    isOpen = false;
    menu.classList.remove("open");
    resetMenuStyles();
  }

  function resetMenuStyles() {
    menu.style.display = "none";
    menu.style.opacity = "";
    menu.style.pointerEvents = "";
    menu.style.left = "";
    menu.style.top = "";
    menu.style.position = "";
    menu.style.zIndex = "";
  }

  // === События ===

  dot.addEventListener("click", (e) => {
    if (document.body.classList.contains("dragging-dotcore")) return;
    e.stopPropagation();
    isOpen ? closeMenu() : openMenu();
  });

  window.addEventListener("resize", () => {
    if (isOpen) positionMenu();
  });

  window.addEventListener("scroll", () => {
    if (isOpen) positionMenu();
  });

  document.addEventListener("click", (e) => {
    if (
      isOpen &&
      !menu.contains(e.target) &&
      !dot.contains(e.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (isOpen && e.key === "Escape") {
      closeMenu();
    }
  });

  // === Поддержка перемещения капсулы (cast by dotCoreDrag.js) ===
  document.addEventListener("dotcore:moved", () => {
    if (isOpen) positionMenu();
  });

  // Изначально скрыто
  resetMenuStyles();
}