// js/ui/contacts.js
// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Скрыть dot-меню
  const menu = document.getElementById("dot-core-menu");
  if (menu) menu.style.display = "none";

  // Очистить DOT и включить режим input
  dot.innerHTML = "";
  dot.classList.add("dot-expanded");

  // Поле ввода
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter UID";
  input.className = "dot-contact-input";

  // Плюс-кнопка
  const button = document.createElement("button");
  button.innerHTML = "+";
  button.className = "dot-add-btn";

  button.addEventListener("click", async () => {
    const uid = input.value.trim();
    if (!uid) return;
    await addContact(uid);
    input.value = "";
    input.focus();
  });

  dot.appendChild(input);
  dot.appendChild(button);

  // 📏 Убедиться, что DOT не вылезает за экран
  const bounding = dot.getBoundingClientRect();
  const padding = 12;
  if (bounding.right > window.innerWidth - padding) {
    const shift = bounding.right - window.innerWidth + padding;
    dot.style.transform = `translateX(calc(-50% - ${shift}px))`;
  } else if (bounding.left < padding) {
    const shift = padding - bounding.left;
    dot.style.transform = `translateX(calc(-50% + ${shift}px))`;
  }

  // ⌨️ Фокус
  setTimeout(() => {
    input.focus();
  }, 100);

  // ❌ Закрытие по клику вне
  const handleOutsideClick = (e) => {
    if (!dot.contains(e.target)) {
      dot.classList.remove("dot-expanded");
      dot.innerHTML = "";
      dot.style.transform = ""; // сброс сдвига
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    }
  };

  // ❌ Закрытие по ESC
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      dot.classList.remove("dot-expanded");
      dot.innerHTML = "";
      dot.style.transform = "";
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
  }, 50);
}
