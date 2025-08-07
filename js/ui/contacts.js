// js/ui/contacts.js
import { addContact, getContacts } from "../handlers/contactHandlers.js";

export async function renderContactsUI(initialUid = "") {
  const container = document.getElementById("main-content");
  container.innerHTML = ""; // Очистка

  const wrapper = document.createElement("div");
  wrapper.className = "contacts-wrapper";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter user UID to add";
  input.className = "contacts-input";
  input.value = initialUid;

  const button = document.createElement("button");
  button.textContent = "Add Contact";
  button.className = "contacts-add-btn";

  button.addEventListener("click", async () => {
    const uid = input.value.trim();
    if (!uid) return;
    await addContact(uid);
    input.value = "";
    await renderContactsUI();
  });

  const list = document.createElement("ul");
  list.className = "contacts-list";

  const contacts = await getContacts();
  contacts.forEach(uid => {
    const li = document.createElement("li");
    li.textContent = uid;
    li.className = "contacts-list-item";
    list.appendChild(li);
  });

  wrapper.appendChild(input);
  wrapper.appendChild(button);
  wrapper.appendChild(list);
  container.appendChild(wrapper);
}