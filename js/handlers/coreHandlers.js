// js/handlers/coreHandlers.js

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');
  if (!dot || !menu) return;

  let isOpen = false;

  // === Динамическое позиционирование меню возле DotCore ===
  function positionMenu() {
    // Временно показать меню для вычисления размеров
    menu.style.display = "flex";
    menu.style.visibility = "hidden";

    const dotRect = dot.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    // По умолчанию снизу и по центру относительно DotCore
    let left = dotRect.left + dotRect.width / 2 - menuRect.width / 2;
    let top = dotRect.bottom + 8;

    // Корректировка, чтобы меню не вышло за экран
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

  // Открытие/закрытие меню по клику на DotCore
  dot.addEventListener('click', (e) => {
    // Если сейчас происходит drag, блокируем открытие меню
    if (document.body.classList.contains('dragging-dotcore')) return;

    e.stopPropagation();
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    if (isOpen) {
      positionMenu();
    } else {
      // Сбросить стили
      menu.style.display = "";
     