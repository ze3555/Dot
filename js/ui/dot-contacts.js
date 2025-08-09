
export function renderContacts({ onBack } = {}) {
  const root = document.createElement("div");
  root.style.display = "grid";
  root.style.gridTemplateColumns = "auto 1fr auto";
  root.style.gap = "8px";
  root.innerHTML = `
    <button type="button" data-act="back" aria-label="Back">←</button>
    <input type="text" placeholder="Search or add by username…" aria-label="Search" />
    <button type="button" data-act="add" aria-label="Add contact">＋</button>
  `;
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.act === "back") onBack?.();
    if (b.dataset.act === "add")  {/* hook later */}
  });
  return root;
}