// js/handlers/coreHandlers.js
import { setTheme } from "../theme/index.js";

/**
 * Dot expands into a tiny square with two buttons: "Function" and "Theme".
 * - Smooth animated expand/collapse straight from the Dot
 * - Disables drag while open
 * - Outside click / ESC to close
 * - "Function" emits window event 'dot:function'
 * - "Theme" toggles light/dark
 *
 * Keep the export name to match main.js: setupDotCoreMenu()
 */
export function setupDotCoreMenu() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  injectStylesOnce();

  let isOpen = false;
  let restoring = false;
  let panel = null;

  // Save/restore inline styles to avoid layout shifts
  const saved = {
    position: "",
    left: "",
    top: "",
    width: "",
    height: "",
    zIndex: "",
    borderRadius: "",
    transition: "",
    transform: "",
  };

  // Prevent drag when expanded (capture before dotCoreDrag handlers)
  dot.addEventListener(
    "pointerdown",
    (e) => {
      if (isOpen) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true
  );

  // Toggle on click (capture to suppress other dot click effects)
  dot.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (dot.classList.contains("is-dragging")) return; // ignore if currently dragging
      isOpen ? collapse() : expand();
    },
    true
  );

  function expand() {
    if (isOpen) return;
    isOpen = true;

    // Snapshot current rect and inline styles
    const rect = dot.getBoundingClientRect();
    for (const k in saved) saved[k] = dot.style[k] || "";

    // Pin the Dot in place (fixed) at the exact on-screen coordinates
    dot.style.position = "fixed";
    dot.style.left = rect.left + "px";
    dot.style.top = rect.top + "px";
    dot.style.width = rect.width + "px";
    dot.style.height = rect.height + "px";
    dot.style.transform = "translate3d(0,0,0)";
    dot.style.zIndex = "2147483647"; // above everything
    dot.style.transition =
      "left 180ms cubic-bezier(.2,.8,.2,1), " +
      "top 180ms cubic-bezier(.2,.8,.2,1), " +
      "width 180ms cubic-bezier(.2,.8,.2,1), " +
      "height 180ms cubic-bezier(.2,.8,.2,1), " +
      "border-radius 180ms cubic-bezier(.2,.8,.2,1), " +
      "box-shadow 180ms cubic-bezier(.2,.8,.2,1)";

    // Visual state
    dot.classList.add("dot-expanded");

    // Create panel with buttons
    panel = document.createElement("div");
    panel.className = "dot-panel";
    panel.innerHTML = `
      <button type="button" class="dot-btn" id="dot-fn" aria-label="Run Function">Function</button>
      <button type="button" class="dot-btn" id="dot-theme" aria-label="Toggle Theme">Theme</button>
    `;
    dot.appendChild(panel);

    // Wire actions
    panel.querySelector("#dot-fn")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("dot:function"));
      collapse();
    });
    panel.querySelector("#dot-theme")?.addEventListener("click", () => {
      const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
      setTheme(next);
    });

    // Close interactions
    document.addEventListener("keydown", onEsc, true);
    document.addEventListener("click", onOutsideClick, true);

    // Compute target square and animate from the center
    const TARGET = Math.max(148, Math.min(196, Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.28)));
    const dx = (TARGET - rect.width) / 2;
    const dy = (TARGET - rect.height) / 2;

    // Ensure color background matches theme
    if (document.body.classList.contains("theme-dark")) {
      dot.style.background = "#111";
      dot.style.color = "#fff";
    } else {
      dot.style.background = "#fff";
      dot.style.color = "#111";
    }
    dot.style.boxShadow = "0 16px 40px rgba(0,0,0,0.35)";

    // Next frame → animate
    requestAnimationFrame(() => {
      dot.style.left = rect.left - dx + "px";
      dot.style.top = rect.top - dy + "px";
      dot.style.width = TARGET + "px";
      dot.style.height = TARGET + "px";
      dot.style.borderRadius = "16px";

      // Stagger: reveal content slightly after growth starts
      setTimeout(() => {
        panel.classList.add("visible");
      }, 60);
    });
  }

  function collapse() {
    if (!isOpen || restoring) return;
    restoring = true;
    panel?.classList.remove("visible");

    // Animate back to original size/position
    const back = () => {
      dot.style.left = saved.left;
      dot.style.top = saved.top;
      dot.style.width = saved.width;
      dot.style.height = saved.height;
      dot.style.borderRadius = saved.borderRadius || "";
      dot.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
    };

    back();

    // After transition ends, clean up
    const onDone = () => {
      dot.removeEventListener("transitionend", onDone);
      panel?.remove();
      panel = null;

      // Restore inline styles
      dot.style.position = saved.position;
      dot.style.left = saved.left;
      dot.style.top = saved.top;
      dot.style.width = saved.width;
      dot.style.height = saved.height;
      dot.style.zIndex = saved.zIndex;
      dot.style.borderRadius = saved.borderRadius;
      dot.style.transition = saved.transition;
      dot.style.transform = saved.transform;
      dot.style.background = "";
      dot.style.boxShadow = "";

      dot.classList.remove("dot-expanded");

      document.removeEventListener("keydown", onEsc, true);
      document.removeEventListener("click", onOutsideClick, true);

      isOpen = false;
      restoring = false;
    };
    dot.addEventListener("transitionend", onDone);
  }

  function onEsc(e) {
    if (e.key === "Escape") collapse();
  }
  function onOutsideClick(e) {
    if (!dot.contains(e.target)) collapse();
  }
}

function injectStylesOnce() {
  if (document.getElementById("dot-expander-styles")) return;
  const style = document.createElement("style");
  style.id = "dot-expander-styles";
  style.textContent = `
    .dot-core.dot-expanded {
      /* ensure content layout while expanded */
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .dot-core .dot-panel {
      position: absolute;
      inset: 8px;
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(.98);
      transition: opacity 150ms cubic-bezier(.2,.8,.2,1), transform 150ms cubic-bezier(.2,.8,.2,1);
      pointer-events: none; /* enabled when visible */
    }
    .dot-core .dot-panel.visible {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
    .dot-core .dot-btn {
      -webkit-tap-highlight-color: transparent;
      appearance: none;
      border: 1px solid currentColor;
      background: transparent;
      color: currentColor;
      padding: 8px 14px;
      border-radius: 12px;
      font: inherit;
      line-height: 1;
      cursor: pointer;
      opacity: 0.95;
      transition: transform 120ms cubic-bezier(.2,.8,.2,1), opacity 120ms cubic-bezier(.2,.8,.2,1);
    }
    .dot-core .dot-btn:hover { opacity: 1; }
    .dot-core .dot-btn:active { transform: scale(0.98); }
  `;
  document.head.appendChild(style);
}
