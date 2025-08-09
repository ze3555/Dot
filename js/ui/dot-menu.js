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
      toggleTheme();
      // short pulse on the Dot host
      const dot = document.getElementById("dot-core");
      dot?.classList.add("dot-pulse");
      setTimeout(() => dot?.classList.remove("dot-pulse"), 240);
    }

    if (act === "function") callbacks.onFunction?.();
    if (act === "settings") callbacks.onSettings?.();
    if (act === "contacts") callbacks.onContacts?.();
    if (act === "theme")    callbacks.onTheme?.();
  });

  return wrap;
}