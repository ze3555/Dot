
import { toggleTheme } from "../services/theme.js";

export function renderMenu(callbacks) {
  const wrap = document.createElement("div");
  wrap.className = "dot-menu";
  wrap.innerHTML = `
    <button type="button" data-act="function">Function</button>
    <button type="button" data-act="theme">Theme</button>
    <button type="button" data-act="settings">Settings</button>
    <button type="button" data-act="contacts">Contacts</button>
  `;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === "theme") {
      const next = toggleTheme();
      btn.style.opacity = 0.85; // tiny feedback
      setTimeout(() => (btn.style.opacity = ""), 120);
    }

    if (act === "function") callbacks.onFunction?.();
    if (act === "theme")    callbacks.onTheme?.();
    if (act === "settings") callbacks.onSettings?.();
    if (act === "contacts") callbacks.onContacts?.();
  });

  return wrap;
}