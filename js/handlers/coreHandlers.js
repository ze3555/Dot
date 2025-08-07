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

  // === Новый: сброс расширенного состояния
  function collapseDotCore() {
    dot.classList.remove('expanded');
    dot.innerHTML = ""; // Очистка содержимого
    renderDotCoreIcon(); // Вернуть иконку DOT
  }

  // === Вставка иконки DOT обратно
  function renderDotCoreIcon() {
    const span = document.createElement('span');
    span.className = "dot-icon";
    dot.appendChild(span);
  }

  // === Обработчик кнопки Contacts (id = btn-contacts)
  const contactsBtn = document.getElementById("btn-contacts");
  if (contactsBtn) {
    contactsBtn.addEventListener("click", () => {
      isOpen = false;
      menu.classList.remove('open');
      menu.style.display = "";
      menu.style.left = "";
      menu.style.top = "";
      menu.style.position = "";
      menu.style.visibility = "";
      menu.style.zIndex = "";

      dot.classList.add("expanded");
      dot.innerHTML = `
        <input type="text" placeholder="Search contacts..." />
        <button class="add-btn">+</button>
      `;
    });
  }

  // === Сброс состояния при клике вне расширенного DotCore
  document.addEventListener("click", (e) => {
    if (
      dot.classList.contains("expanded") &&
      !dot.contains(e.target)
    ) {
      collapseDotCore();
    }

    // Также закрываем меню если клик вне
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

  // === Стандартное открытие/закрытие DotCore-меню
  dot.addEventListener('click', (e) => {
    if (document.body.classList.contains('dragging-dotcore')) return;
    if (dot.classList.contains("expanded")) return;

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

  window.addEventListener('resize', () => { if (isOpen) positionMenu(); });
  window.addEventListener('scroll', () => { if (isOpen) positionMenu(); });

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
    if (dot.classList.contains("expanded") && e.key === "Escape") {
      collapseDotCore();
    }
  });
}
