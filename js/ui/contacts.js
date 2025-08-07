// js/ui/contacts.js
import { addContact, getContacts } from "../handlers/contactHandlers.js";

export async function renderContactsUI() {
  const container = document.getElementById("main");
  container.innerHTML = ""; // Очистка

  const wrapper = document.createElement("div");
  wrapper.className = "contacts-wrapper";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter user UID to add";

  const button = document.createElement("button");
  button.textContent = "Add Contact";

  button.addEventListener("click", async () => {
    const uid = input.value.trim();
    if (!uid) return;
    await addContact(uid);
    input.value = "";
    await renderContactsUI();
  });

  const list = document.createElement("ul");
  const contacts = await getContacts();
  contacts.forEach(uid => {
    const li = document.createElement("li");
    li.textContent = uid;
    list.appendChild(li);
  });

  wrapper.appendChild(input);
  wrapper.appendChild(button);
  wrapper.appendChild(list);
  container.appendChild(wrapper);
}