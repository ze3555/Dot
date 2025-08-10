
export function renderSettings({ onBack } = {}) {
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gridTemplateRows = "auto 1fr";
  wrap.style.gap = "8px";
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <strong>Settings</strong>
      <button type="button" data-act="back" aria-label="Back">Close</button>
    </div>
    <div style="opacity:.8">
      <p style="margin:0">Base settings placeholder.</p>
    </div>
  `;
  wrap.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-act=back]");
    if (b) onBack?.();
  });
  return wrap;
}