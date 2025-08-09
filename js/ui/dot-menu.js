// js/ui/dot-menu.js
// Вертикальное меню без эмодзи. Четыре кнопки, клики отдаются через колбэки.

export function renderMenu(callbacks = {}) {
  const { onFunction, onTheme, onSettings, onContacts } = callbacks;

  const wrap = document.createElement("div");
  wrap.className = "dot-menu";
  wrap.innerHTML = `
    <button type="button" class="dot-menu__btn" data-act="function">Function</button>
    <button type="button" class="dot-menu__btn" data-act="theme">Theme</button>
    <button type="button" class="dot-menu__btn" data-act="settings">Settings</button>
    <button type="button" class="dot-menu__btn" data-act="contacts">Contacts</button>
  `;

  // Делегирование кликов
  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    switch (btn.dataset.act) {
      case "function": onFunction && onFunction(); break;
      case "theme":    onTheme && onTheme();       break;
      case "settings": onSettings && onSettings(); break;
      case "contacts": onContacts && onContacts(); break;
    }
  });

  // Клавиатура
  wrap.addEventListener("keydown", (e) => {
    const items = Array.from(wrap.querySelectorAll(".dot-menu__btn"));
    const idx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); items[items.length - 1]?.focus(); }
    else if (e.key === "Enter" || e.key === " ") {
      const el = document.activeElement;
      if (el && el.matches(".dot-menu__btn")) el.click();
    }
  });

  // Автофокус
  queueMicrotask(() => wrap.querySelector(".dot-menu__btn")?.focus());

  return wrap;
}