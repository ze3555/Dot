import { getState, setState } from "../core/state.js";

const LONG_MS = 450; // порог long-press

export function mountDotUI(){
  const dot = document.getElementById("dot-core");
  const menu = document.getElementById("dot-menu");
  const fnPop = document.getElementById("function-pop");
  const themes = document.getElementById("themes-panel");
  const contactsBar = document.getElementById("contacts-bar");
  const settings = document.getElementById("settings-panel");
  const fineTune = document.getElementById("finetune-panel");

  // Settings bindings
  const $drag = document.getElementById("toggle-drag");
  const $glow = document.getElementById("toggle-glow");
  const $ftDrag = document.getElementById("ft-drag");
  const $ftSnap = document.getElementById("ft-snap");

  // sync UI from state
  const st = getState();
  $drag.checked = !!st.dragEnabled;
  $glow.checked = !!st.lowGlow;
  $ftDrag.checked = !!st.dragEnabled;
  $ftSnap.checked = !!st.snapOnClose;

  $drag.addEventListener("change", () => setState({ dragEnabled: $drag.checked }));
  $glow.addEventListener("change", () => setState({ lowGlow: $glow.checked }));
  $ftDrag.addEventListener("change", () => {
    setState({ dragEnabled: $ftDrag.checked });
    $drag.checked = $ftDrag.checked;
  });
  $ftSnap.addEventListener("change", () => setState({ snapOnClose: $ftSnap.checked }));

  // Close helpers
  document.querySelectorAll("[data-close]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const sel = btn.getAttribute("data-close");
      const node = document.querySelector(sel);
      if (node) node.hidden = true;
      if (getState().snapOnClose) snapDotToCenter(dot);
    });
  });

  // DOT tap → toggle menu
  dot.addEventListener("click", ()=>{
    if (drag.justDragged) { drag.justDragged = false; return; }
    const open = menu.hidden;
    menu.hidden = !open;
    dot.setAttribute("aria-expanded", String(open));
    positionMenuUnderDot(dot, menu);
    fnPop.hidden = true;
  });

  // Outside click closes floaters
  document.addEventListener("pointerdown", (e)=>{
    if (!e.target.closest("#dot-core, #dot-menu, #function-pop, #themes-panel, #settings-panel, #finetune-panel, #contacts-bar")) {
      hideAll();
      if (getState().snapOnClose) snapDotToCenter(dot);
    }
  });

  function hideAll(){
    menu.hidden = true;
    fnPop.hidden = true;
    themes.hidden = true;
    settings.hidden = true;
    fineTune.hidden = true;
    contactsBar.hidden = true;
    dot.setAttribute("aria-expanded", "false");
  }

  // Menu actions + long-press
  const long = makeLongPress();
  menu.addEventListener("pointerdown", long.onDown);
  menu.addEventListener("pointerup", long.onUp);
  menu.addEventListener("pointerleave", long.cancel);

  menu.addEventListener("click", (e)=>{
    const btn = e.target.closest(".dot-btn");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "function") {
      if (!long.wasLong) {
        placePopoverNear(fnPop, btn);
        fnPop.hidden = false;
      } else {
        themes.hidden = false;
      }
      long.wasLong = false;
    }

    if (action === "contacts") {
      hideAll();
      contactsBar.hidden = false;
      document.getElementById("contacts-search").focus({ preventScroll: true });
    }

    if (action === "settings") {
      if (!long.wasLong) {
        settings.hidden = false;
      } else {
        fineTune.hidden = false;
      }
      long.wasLong = false;
    }
  });

  long.onLong = (target)=>{
    const btn = target.closest(".dot-btn");
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "function") {
      themes.hidden = false;
    }
    if (action === "settings") {
      fineTune.hidden = false;
    }
  };

  // Drag (optional)
  const drag = makeDrag(dot);
  enableDrag(dot, drag, getState().dragEnabled);

  // react to state drag toggle
  const observer = new MutationObserver(()=>{
    enableDrag(dot, drag, getState().dragEnabled);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-dot-lowglow"] }); // просто чтобы была активность; drag берём из getState() при кликах

  // resize/viewport clamp
  window.addEventListener("resize", ()=> clampToViewport(dot));
  clampToViewport(dot); // стартовая проверка
}

/* ---------- helpers ---------- */

function positionMenuUnderDot(dot, menu){
  const r = dot.getBoundingClientRect();
  menu.style.left = `calc(${Math.round(r.left + r.width/2)}px)`;
  menu.style.top  = `calc(${Math.round(r.top + r.height + 10)}px)`;
  menu.style.translate = "-50% 0";
}

function placePopoverNear(pop, anchorBtn){
  const r = anchorBtn.getBoundingClientRect();
  pop.style.left = `${Math.round(r.right + 10)}px`;
  pop.style.top  = `${Math.round(r.top)}px`;
  pop.hidden = false;
}

function snapDotToCenter(dot){
  dot.style.left = "50%";
  dot.style.top = "50%";
  dot.style.translate = "-50% -50%";
}

function clampToViewport(dot){
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sz = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--dot-size")) || 64;
  const r = dot.getBoundingClientRect();
  let x = r.left + r.width/2;
  let y = r.top + r.height/2;

  x = Math.max(sz/2 + 8, Math.min(vw - sz/2 - 8, x));
  y = Math.max(sz/2 + 8, Math.min(vh - sz/2 - 8, y));

  dot.style.left = `${x}px`;
  dot.style.top  = `${y}px`;
  dot.style.translate = "-50% -50%";
}

function enableDrag(dot, drag, on){
  if (on) {
    drag.enable();
    dot.style.cursor = "grab";
  } else {
    drag.disable();
    snapDotToCenter(dot);
    dot.style.cursor = "pointer";
  }
}

function makeLongPress(){
  let t = null;
  let target = null;
  const api = {
    wasLong: false,
    onLong: ()=>{},
    onDown(e){
      const btn = e.target.closest(".dot-btn");
      if (!btn) return;
      target = btn;
      api.wasLong = false;
      t = setTimeout(()=>{
        api.wasLong = true;
        api.onLong(target);
      }, LONG_MS);
    },
    onUp(){
      clearTimeout(t); t = null;
    },
    cancel(){
      clearTimeout(t); t = null; target = null;
    }
  };
  return api;
}

function makeDrag(dot){
  let dragging = false;
  let startX = 0, startY = 0;
  let dotX = 0, dotY = 0;

  const onDown = (e)=>{
    dragging = true;
    dot.setPointerCapture(e.pointerId);
    const r = dot.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    dotX = r.left + r.width/2;
    dotY = r.top + r.height/2;
    dot.style.transition = "none";
    dot.style.cursor = "grabbing";
  };

  const onMove = (e)=>{
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const x = dotX + dx;
    const y = dotY + dy;
    dot.style.left = `${x}px`;
    dot.style.top  = `${y}px`;
    dot.style.translate = "-50% -50%";
    drag.justDragged = true;
  };

  const onUp = (e)=>{
    if (!dragging) return;
    dragging = false;
    dot.releasePointerCapture(e.pointerId);
    dot.style.transition = ""; // вернуть плавность
    dot.style.cursor = "grab";
    clampToViewport(dot);
  };

  const api = {
    justDragged: false,
    enable(){
      dot.addEventListener("pointerdown", onDown);
      dot.addEventListener("pointermove", onMove);
      dot.addEventListener("pointerup", onUp);
      dot.addEventListener("pointercancel", onUp);
    },
    disable(){
      dot.removeEventListener("pointerdown", onDown);
      dot.removeEventListener("pointermove", onMove);
      dot.removeEventListener("pointerup", onUp);
      dot.removeEventListener("pointercancel", onUp);
    }
  };
  return api;
}
