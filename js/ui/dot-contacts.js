const RE_USERNAME = /^[a-z0-9_]{3,20}$/;

export function renderContacts({ onBack } = {}) {
  const root = document.createElement("div");
  root.className = "dot-contacts-wrap";

  const input = document.createElement("input");
  input.className = "dot-contacts-input";
  input.type = "text";
  input.autocomplete = "off";
  input.autocapitalize = "none";
  input.spellcheck = false;
  input.placeholder = "username";
  input.setAttribute("aria-label", "Username");

  const btnAdd = document.createElement("button");
  btnAdd.type = "button";
  btnAdd.className = "dot-contacts-add";
  btnAdd.dataset.act = "add";
  btnAdd.setAttribute("aria-label", "Add contact");
  btnAdd.textContent = "➕";

  root.append(input, btnAdd);

  // валидация
  function syncValidity() {
    const v = input.value.trim().toLowerCase();
    const ok = RE_USERNAME.test(v);
    btnAdd.disabled = !ok;
    root.dataset.valid = ok ? "1" : "0";
  }
  input.addEventListener("input", syncValidity);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!btnAdd.disabled) triggerAdd();
    } else if (e.key === "Escape") {
      input.blur();
      if (typeof onBack === "function") onBack();
    }
  });
  syncValidity();

  btnAdd.addEventListener("click", triggerAdd);

  function triggerAdd() {
    const username = input.value.trim().toLowerCase();
    if (!RE_USERNAME.test(username)) return;
    console.log("[Contacts] add by username:", username);
    btnAdd.disabled = true;
    input.value = "";
    syncValidity();
    input.focus();
  }

  return root;
}
