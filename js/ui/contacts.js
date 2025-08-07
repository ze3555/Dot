// js/ui/contacts.js
import { addContact } from "../handlers/contactHandlers.js";

export function renderContactsUI() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  // Очищаем dot-core и активируем капсульный режим
  dot.innerHTML = "";
  dot.classList.add("dot-expanded");

  const wrapper = document.createElement("div");
  wrapper.className = "dot-inner";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter UID";
  input.className = "dot-contact-input";

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

  // Применяем анимацию
  void dot.offsetWidth;
  dot.classList.add("active");
  input.focus();

  // Закрытие
  function close() {
    dot.classList.remove("dot-expanded", "active");
    dot.innerHTML = "";
    document.removeEventListener("click", onClickOutside);
    document.removeEventListener("keydown", onEsc);
  }

  const onClickOutside = (e) => {
    if (!dot.contains(e.target)) close();
  };

  const onEsc = (e) => {
    if (e.key === "Escape") close();
  };

  setTimeout(() => {
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onEsc);
  }, 50);
}