// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Скрыть dot-меню
  const menu = document.getElementById("dot-core-menu");
  if (menu) menu.style.display = "none";

  // Очистить и подготовить DOT
  dot.innerHTML = "";
  dot.classList.add("dot-expanded");

  // Обёртка
  const wrapper = document.createElement("div");
  wrapper.className = "dot-inner";

  // Ввод
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter UID";
  input.className = "dot-contact-input";

  // Кнопка "+"
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

  // 💥 Форс рендер, потом активируем
  void dot.offsetWidth;
  dot.classList.add("active");
  input.focus();

  // ❌ Закрытие
  function closeDotInput() {
    dot.classList.remove("dot-expanded", "active");
    dot.innerHTML = "";
    dot.style.transform = "";
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  }

  const handleOutsideClick = (e) => {
    if (!dot.contains(e.target)) closeDotInput();
  };

  const handleEscape = (e) => {
    if (e.key === "Escape") closeDotInput();
  };

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
  }, 50);
}