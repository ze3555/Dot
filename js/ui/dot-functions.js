
export function renderFunctions({ onBack } = {}) {
  const wrap = document.createElement("div");
  wrap.style.display = "grid";
  wrap.style.gridTemplateRows = "auto 1fr";
  wrap.style.gap = "8px";
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
      <strong>Functions</strong>
      <button type="button" data-act="back" aria-label="Back">Close</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button type="button">ChatGPT</button>
      <button type="button">Steam</button>
    </div>
  `;
  wrap.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-act=back]");
    if (b) onBack?.();
  });
  return wrap;
}