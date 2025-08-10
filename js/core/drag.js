import { getState, setState } from "./state.js";

/**
 * Enable dragging the Dot in IDLE. On release, snap to nearest side (dock),
 * unless body has .dot-dock-off => then return to center.
 */
export function initDotDrag() {
  const dot = document.getElementById("dot-core");
  if (!dot) return;

  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;
  let moved = false;

  let suppressClickOnce = false;

  function getDotRect() {
    const r = dot.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function readDockFlags() {
    return {
      docked: dot.classList.contains("dot-docked"),
      left: dot.classList.contains("dot-docked-left"),
      right: dot.classList.contains("dot-docked-right"),
    };
  }

  const toLeft = () => {
    dot.classList.add("dot-docked","dot-docked-left");
    dot.classList.remove("dot-docked-right");
    const r = getDotRect();
    dot.style.left = `0px`;
    dot.style.top  = `${r.top}px`;
    dot.style.transform = "translate(0,0)";
  };
  const toRight = () => {
    dot.classList.add("dot-docked","dot-docked-right");
    dot.classList.remove("dot-docked-left");
    const r = getDotRect();
    const vw = window.innerWidth;
    dot.style.left = `${vw - r.width}px`;
    dot.style.top  = `${r.top}px`;
    dot.style.transform = "translate(0,0)";
  };
  const returnToCenter = () => {
    dot.classList.remove("dot-free","dot-docked","dot-docked-left","dot-docked-right");
    dot.style.left = "";
    dot.style.top = "";
    dot.style.transform = "translate(-50%, -50%)";
  };

  const ORIGIN_MARGIN = 16;

  function snapToSide() {
    const r = getDotRect();
    const vw = window.innerWidth, vh = window.innerHeight;

    // Кламп по вертикали
    const safeTop = Math.max(8, Math.min(r.top, vh - r.height - 8));
    dot.style.top = `${safeTop}px`;

    // Выбираем ближайшую сторону
    if (r.left + r.width / 2 < vw / 2) {
      toLeft();
    } else {
      toRight();
    }
  }

  dot.addEventListener("pointerdown", (e) => {
    if (getState() !== "idle") return;

    // Разрешим «тап по докнутой точке» даже когда drag выключен — это не drag.
    const dragDisabled = document.body.classList.contains("dot-drag-off");
    if (dragDisabled) return; // именно drag не начинаем; click обработается как обычно

    dragging = true;
    moved = false;
    suppressClickOnce = false;

    dot.setPointerCapture(e.pointerId);

    const r = getDotRect();
    originLeft = r.left;
    originTop  = r.top;
    startX = e.clientX;
    startY = e.clientY;

    // При старте свободного перемещения ставим флаг
    dot.classList.add("dot-free");
  });

  dot.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;

    dot.style.left = `${originLeft + dx}px`;
    dot.style.top  = `${originTop + dy}px`;
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    dot.releasePointerCapture(e.pointerId);

    if (moved) {
      suppressClickOnce = true;
      if (document.body.classList.contains("dot-dock-off")) {
        returnToCenter();
      } else {
        snapToSide();
      }
    }

    // Если реального движения не было — оставляем всё как есть.
    dot.classList.remove("dot-free");
  };

  dot.addEventListener("pointerup", endDrag);
  dot.addEventListener("pointercancel", endDrag);

  // На click после перетаскивания — гасим единожды, чтобы не открывать меню
  dot.addEventListener("click", (e) => {
    if (suppressClickOnce) {
      e.stopPropagation();
      suppressClickOnce = false;
    } else {
      // Удобство: тап по докнутой точке в idle развязывает и сразу открывает меню
      if (getState() === "idle" && dot.classList.contains("dot-docked")) {
        returnToCenter();
        queueMicrotask(() => setState("menu"));
        e.stopPropagation();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (dot.classList.contains("dot-docked")) {
      snapToSide();
    } else if (dot.classList.contains("dot-free")) {
      const r = getDotRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const x = Math.max(8, Math.min(r.left, vw - r.width - 8));
      const y = Math.max(8, Math.min(r.top,  vh - r.height - 8));
      dot.style.left = `${x}px`;
      dot.style.top  = `${y}px`;
    }
  });
}