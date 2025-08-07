// js/handlers/coreHandlers.js

export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');
  const contactsWrapper = document.getElementById('contacts-wrapper'); // Контейнер поиска контактов

  if (!dot || !menu) return;

  let isOpen = false;

  // === Позиционирование меню возле DotCore ===
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

  // Перепозиционировать меню при изменении окна/скролле
  window.addEventListener('resize', () => { if (isOpen) positionMenu(); });
  window.addEventListener('scroll', () => { if (isOpen) positionMenu(); });

  // Закрытие меню и contacts по клику вне
  document.addEventListener('click', (e) => {
    // --- Закрыть меню ---
    if (
      isOpen &&
      !menu.contains(e.target) &&
      !dot.contains(e.target)
    ) {
      closeMenu();
    }
    // --- Закрыть contacts ---
    if (
      contactsWrapper &&
      !contactsWrapper.contains(e.target) &&
      e.target.id !== 'contacts-btn'
    ) {
      contactsWrapper.classList.add('hidden');
    }
  });

  // ESC закрывает меню и contacts
  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === "Escape") closeMenu();
    if (contactsWrapper && !contactsWrapper.classList.contains('hidden') && e.key === "Escape") {
      contactsWrapper.classList.add('hidden');
    }
  });

  // Закрывать меню по любой кнопке в меню
  menu.addEventListener('click', (e) => {
    if (e.target.closest('button')) closeMenu();
  });
}