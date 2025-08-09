// Капсула поиска контактов внутри #dot-core
// Валидация username: a-z 0-9 _ длина 3..20

const RE_USERNAME = /^[a-z0-9_]{3,20}$/;

export function renderContacts({ onBack } = {}) {
  const root = document.createElement("div");
  root.className = "dot-contacts-wrap";

  // Left icon (search). Клик по нему можно трактовать как "назад" если нужно.
  const btnSearch = document.createElement("button");
  btnSearch.type = "button";
  btnSearch.className = "dot-contacts-btn";
  btnSearch.dataset.act = "search";
  btnSearch.setAttribute("aria-label", "Search");
  btnSearch.textContent = "🔍";

  // Input
  const input = document.createElement("input");
  input.className = "dot-contacts-input";
  input.type = "text";
  input.placeholder = "Search or add by username…";
  input.autocomplete = "off";
  input.inputMode = "text";
  input.enterKeyHint = "search";

  // Add button
  const btnAdd = document.createElement("button");
  btnAdd.type = "button";
  btnAdd.className = "dot-contacts-btn";
  btnAdd.dataset.act = "add";
  btnAdd.setAttribute("aria-label", "Add contact");
  btnAdd.textContent = "＋";
  btnAdd.disabled = true;

  // Optional helper line (errors / tips)
  const helper = document.createElement("div");
  helper.className = "dot-contacts-helper";
  helper.hidden = true;

  // Layout
  root.append(btnSearch, input, btnAdd);
  // helper можно показать ниже капсулы; если надо внутри — раскомментируй:
  // root.append(helper);

  // Stop closing on outside-click (handled в dot.js для не-idle состояний)
  root.addEventListener("click", (e) => e.stopPropagation());

  // Autofocus после монтирования
  queueMicrotask(() => input.focus());

  // Enable/disable "add" по валидации
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
    if (e.key === "Escape") {
      e.stopPropagation();
      // Возврат в меню (если передан onBack)
      onBack?.();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (!btnAdd.disabled) triggerAdd();
    }
  });

  // Actions
  btnSearch.addEventListener("click", () => {
    // По умолчанию ничего — это просто иконка.
    // Если хочешь "назад" на тап по лупе — раскомментируй:
    // onBack?.();
    input.focus();
  });

  btnAdd.addEventListener("click", triggerAdd);

  function triggerAdd() {
    const username = input.value.trim().toLowerCase();
    if (!RE_USERNAME.test(username)) return;

    // TODO: интеграция с backend (позже)
    // Сейчас просто лог + быстрый визуальный фидбек
    console.log("[Contacts] add by username:", username);

    btnAdd.disabled = true;
    helper.hidden = false;
    helper.textContent = `Invited: ${username}`;
    input.value = "";
    syncValidity();
    input.focus();
  }

  return root;
}