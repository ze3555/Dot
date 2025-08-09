// js/ui/dotContacts.js
import { el } from "../core/dom.js";

let contactsPanel = null;

export function openContacts() {
  if (contactsPanel) return;
  // Контакты: дот растягивается в капсулу-поиск (узкая по высоте), горизонтальная анимация
  contactsPanel = el("div", { class: "dot-contacts-wrap" }, [
    el("input", { class: "dot-contacts-input", type: "text", placeholder: "Search or add…" })
  ]);
  document.body.append(contactsPanel);
  // сразу фокус
  const input = contactsPanel.querySelector(".dot-contacts-input");
  setTimeout(() => input && input.focus(), 0);
  contactsPanel.addEventListener("pointerdown", (e)=>e.stopPropagation());
}

export function closeContacts() {
  if (contactsPanel) { contactsPanel.remove(); contactsPanel = null; }
}