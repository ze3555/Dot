let current = null;

export function closePopover() {
  if (current?.el && current.el.parentNode) current.el.parentNode.removeChild(current.el);
  current = null;
}

export function isPopoverOpen() { return !!current; }

/**
 * Show a popover anchored to the Dot.
 * @param {HTMLElement} content
 * @param {{side?: 'top'|'bottom'|'left'|'right', offset?: number}} [opts]
 */
export function showPopover(content, opts = {}) {
  closePopover();

  const { side = "top", offset = 10 } = opts;
  const host = document.createElement("div");
  host.className = "dot-popover";
  host.appendChild(content);

  document.body.appendChild(host);

  // position relative to #dot-core
  const dot = document.getElementById("dot-core");
  const r = dot.getBoundingClientRect();
  const p = host.getBoundingClientRect();

  let x = r.left + r.width/2 - p.width/2;
  let y = r.top + r.height/2 - p.height/2;

  if (side === "top")    y = r.top - p.height - offset;
  if (side === "bottom") y = r.bottom + offset;
  if (side === "left")   x = r.left - p.width - offset;
  if (side === "right")  x = r.right + offset;

  // keep inside viewport
  x = Math.max(8, Math.min(x, window.innerWidth - p.width - 8));
  y = Math.max(8, Math.min(y, window.innerHeight - p.height - 8));

  host.style.left = `${x}px`;
  host.style.top  = `${y}px`;

  // close on outside or ESC
  const outside = (e) => { if (!host.contains(e.target)) cleanup(); };
  const esc = (e) => { if (e.key === "Escape") cleanup(); };

  function cleanup() {
    document.removeEventListener("click", outside, true);
    document.removeEventListener("keydown", esc, true);
    closePopover();
  }

  document.addEventListener("click", outside, true);
  document.addEventListener("keydown", esc, true);

  current = { el: host, cleanup };
  return host;
}