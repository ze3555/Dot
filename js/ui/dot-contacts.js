// js/ui/dot-contacts.js
const RE_USERNAME = /^[a-z0-9_]{3,20}$/;

import { initContactsStore, search as searchContacts, add as addContact, remove as removeContact, canAdd as canAddContact } from "../services/contacts.js";

export function renderContacts({ onBack } = {}) {
  // гарантируем, что стор прогружен (safe для повторных вызовов)
  initContactsStore();

  const root = document.createElement("div");
  root.className = "dot-contacts-wrap";

  // INPUT
  const input = document.createElement("input");
  input.className = "dot-contacts-input";
  input.type = "text";
  input.autocomplete = "off";
  input.autocapitalize = "none";
  input.spellcheck = false;
  input.placeholder = "username";
  input.setAttribute("aria-label", "Username");

  // ADD (+)
  const btnAdd = document.createElement("button");
  btnAdd.type = "button";
  btnAdd.className = "dot-contacts-add";
  btnAdd.dataset.act = "add";
  btnAdd.setAttribute("aria-label", "Add contact");
  btnAdd.textContent = "➕";
  btnAdd.disabled = true;

  // LIST
  const list = document.createElement("div");
  list.className = "dot-contacts-list";

  root.append(input, btnAdd, list);

  function renderList(items) {
    list.innerHTML = "";
    if (!items || items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "dot-contacts-empty";
      empty.textContent = "Пусто. Добавь username через плюс справа.";
      list.appendChild(empty);
      return;
    }
    for (const c of items) {
      const row = document.createElement("div");
      row.className = "dot-contacts-row";

      const name = document.createElement("div");
      name.className = "dot-contacts-name";
      name.textContent = c.username;

      const actions = document.createElement("div");
      actions.className = "dot-contacts-actions";

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "dot-contacts-remove";
      removeBtn.setAttribute("aria-label", `Remove ${c.username}`);
      removeBtn.textContent = "✕";

      removeBtn.addEventListener("click", () => {
        if (removeContact(c.username)) {
          refresh();
          // вернуть фокус в инпут для скорости набора
          input.focus();
        }
      });

      actions.append(removeBtn);
      row.append(name, actions);
      list.appendChild(row);
    }
  }

  function refresh() {
    const q = input.value.trim().toLowerCase();
    renderList(searchContacts(q));
    syncValidity();
  }

  function syncValidity() {
    const v = input.value.trim().toLowerCase();
    const ok = RE_USERNAME.test(v) && canAddContact(v);
    btnAdd.disabled = !ok;
    root.dataset.valid = ok ? "1" : "0";
  }

  function triggerAdd() {
    const username = input.value.trim().toLowerCase();
    if (!RE_USERNAME.test(username)) return;
    if (!canAddContact(username)) return;
    if (addContact(username)) {
      input.value = "";
      refresh();
      input.focus();
    }
  }

  // events
  input.addEventListener("input", () => {
    refresh();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!btnAdd.disabled) triggerAdd();
    } else if (e.key === "Escape") {
      input.blur();
      if (typeof onBack === "function") onBack();
    }
  });
  btnAdd.addEventListener("click", triggerAdd);

  // кросс-обновление, если лист изменён извне
  window.addEventListener("dot:contacts-changed", refresh);

  // первичная отрисовка
  refresh();

  return root;
}
