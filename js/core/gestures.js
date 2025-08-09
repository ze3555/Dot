// js/core/gestures.js
// Короткое/долгое нажатие (longpress)
export function bindPress(node, { onTap, onLong, delay = 420 }) {
  let tid = null, pressed = false, moved = false;

  const start = (e) => {
    pressed = true; moved = false;
    tid = setTimeout(() => {
      tid = null;
      if (pressed && !moved && onLong) onLong(e);
    }, delay);
  };
  const move = () => { if (pressed) moved = true; };
  const end = (e) => {
    const wasLong = tid == null && pressed && !moved;
    clearTimeout(tid); tid = null;
    if (pressed && !moved && !wasLong && onTap) onTap(e);
    pressed = false; moved = false;
  };

  node.addEventListener("pointerdown", start, { passive: true });
  node.addEventListener("pointermove", move, { passive: true });
  node.addEventListener("pointerup", end, { passive: true });
  node.addEventListener("pointercancel", end, { passive: true });

  return () => {
    node.removeEventListener("pointerdown", start);
    node.removeEventListener("pointermove", move);
    node.removeEventListener("pointerup", end);
    node.removeEventListener("pointercancel", end);
  };
}