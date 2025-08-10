const RE_USERNAME = /^[a-z0-9_]{3,20}$/;

export function renderContacts({ onBack } = {}) {
  const root = document.createElement("div");
  root.className = "dot-contacts-wrap";

  const btnSearch = document.createElement("button");
  btnSearch.type = "button";
  btnSearch.className = "dot-contacts-btn";
  btnSearch.dataset.act = "search";
  btnSearch.setAttribute("aria-label", "Search");
  btnSearch.textContent = "🔍";

  const input = document.createElement("input");
  input.className = "dot-contacts-input";
  input.type = "text";
  input.placeholder = "Search or add by username…";
  input.autocomplete = "off";
  input.inputMode = "text";
  input.enterKeyHint = "search";

  const btnAdd = document.createElement("button");
  btnAdd.type = "button";
  btnAdd.className = "dot-contacts-btn";
  btnAdd.dataset.act = "add";
  btnAdd.setAttribute("aria-label", "Add contact");
  btnAdd.textContent = "＋";
  btnAdd.disabled = true;

  const helper = document.createElement("div");
  helper.className = "dot-contacts-helper";
  helper.hidden = true;

  root.append(btnSearch, input, btnAdd);

  root.addEventListener("click", (e) => e.stopPropagation());

  // live entrance + autofocus
  queueMicrotask(() => {
    root.classList.add("is-live");
    input.focus();
  });

  function syncValidity() {
    const value = input.value.trim().toLowerCase();
    const ok = RE_USERNAME.test(value);
    btnAdd.disabled = !ok;
    helper.hidden = ok || !value;
    if (!ok && value) {
      helper.textContent = "Username: a–z, 0–9, _ (3–20)";
    }
  }

  input.addEventListener("input", syncValidity);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.stopPropagation(); onBack?.(); }
    if (e.key === "Enter")  { e.preventDefault(); if (!btnAdd.disabled) triggerAdd(); }
  });

  btnSearch.addEventListener("click", () => input.focus());
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