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

  // Создать внутренний wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "dot-inner";

  // Поле ввода
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter UID";
  input.className = "dot-contact-input";

  // Кнопка +
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

  wrapper.appendChild(input);
  wrapper.appendChild(button);
  dot.appendChild(wrapper);

  // 💥 Форсируем layout для срабатывания анимации
  void dot.offsetWidth;
  dot.classList.add("active");
  input.focus();

  // 📏 Защита от выхода за экран
  const bounding = dot.getBoundingClientRect();
  const padding = 12;
  if (bounding.right > window.innerWidth - padding) {
    const shift = bounding.right - window.innerWidth + padding;
    dot.style.transform = `translateX(calc(-50% - ${shift}px)) scaleX(1)`;
  } else if (bounding.left < padding) {
    const shift = padding - bounding.left;
    dot.style.transform = `translateX(calc(-50% + ${shift}px)) scaleX(1)`;
  }

  // ❌ Закрытие
  const handleOutsideClick = (e) => {
    if (!dot.contains(e.target)) closeDotInput();
  };
  const handleEscape = (e) => {
    if (e.key === "Escape") closeDotInput();
  };
  function closeDotInput() {
    dot.classList.remove("dot-expanded", "active");
    dot.innerHTML = "";
    dot.style.transform = "";
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  }

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
  }, 50);
}