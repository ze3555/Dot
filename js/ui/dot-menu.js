import { toggleTheme } from "../services/theme.js";

export function renderMenu(callbacks) {
  const wrap = document.createElement("div");
  wrap.className = "dot-menu";
  wrap.innerHTML = `
    <button type="button" data-act="function" aria-label="Functions">Function</button>
    <button type="button" data-act="theme" aria-label="Toggle theme">Theme</button>
    <button type="button" data-act="settings" aria-label="Settings">Settings</button>
    <button type="button" data-act="contacts" aria-label="Contacts">Contacts</button>
  `;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === "theme") {
      toggleTheme(); // instant toggle
      // tiny visual feedback
      btn.style.opacity = "0.85";
      setTimeout(() => (btn.style.opacity = ""), 120);
    }

    if (act === "function") callbacks.onFunction?.();
    if (act === "settings") callbacks.onSettings?.();
    if (act === "contacts") callbacks.onContacts?.();
    if (act === "theme")    callbacks.onTheme?.(); // keep menu visible
  });

  return wrap;
}