// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Скрыть dot-меню
  const menu = document.getElementById("dot-core-menu");
  if (menu) menu.style.display = "none";

  // Очистить DOT и активировать режим
  dot.innerHTML = "";
  dot.classList.add("dot-expanded");

  // Создать поле ввода
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter UID";
  input.className = "dot-contact-input";

  // Создать кнопку +
  const button = document.createElement("button");
  button.innerHTML = "+";
  button.className = "dot-add-btn";

  // Добавление контакта
  button.addEventListener("click", async () => {
    const uid = input.value.trim();
    if (!uid) return;
    await addContact(uid);
    input.value = "";
    input.focus();
  });

  // Вставить внутрь DOT
  dot.appendChild(input);
  dot.appendChild(button);

  // Добавить активный класс после короткой паузы (анимация)
  setTimeout(() => {
    dot.classList.add("active");
    input.focus();
  }, 20);

  // 📏 Ограничение по краям экрана
  const bounding = dot.getBoundingClientRect();
  const padding = 12;
  if (bounding.right > window.innerWidth - padding) {
    const shift = bounding.right - window.innerWidth + padding;
    dot.style.transform = `translateX(calc(-50% - ${shift}px))`;
  } else if (bounding.left < padding) {
    const shift = padding - bounding.left;
    dot.style.transform = `translateX(calc(-50% + ${shift}px))`;
  }

  // ❌ Закрытие по клику вне
  const handleOutsideClick = (e) => {
    if (!dot.contains(e.target)) {
      closeDotInput();
    }
  };

  // ❌ Закрытие по ESC
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeDotInput();
    }
  };

  // 💥 Закрытие DOT
  function closeDotInput() {
    dot.classList.remove("dot-expanded", "active");
    dot.innerHTML = "";
    dot.style.transform = "";
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  }

  // Навешиваем слушатели (с паузой чтобы не поймать клик ивента по кнопке)
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
  }, 50);
}
