// js/ui/fine-tune-popover.js
const KEY = "dot.prefs";
// Новые дефолты: без анимаций, без драга, док включён
const DEFAULTS = { drag: false, dock: true, animations: false };

function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}
function savePrefs(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}
function applyPrefs(p) {
  document.body.classList.toggle("dot-drag-off", !p.drag);
  document.body.classList.toggle("dot-dock-off", !p.dock);
  document.body.classList.toggle("dot-anim-off", !p.animations);
}

export function renderFineTunePopover() {
  let prefs = loadPrefs();
  applyPrefs(prefs);

  const wrap = document.createElement("div");
  wrap.className = "dot-popover__grid";

  wrap.append(makeSwitch("Drag", "Enable Dot dragging.", "drag"));
  wrap.append(makeSwitch("Dock", "Attach Dot to composer.", "dock"));
  wrap.append(makeSwitch("Animations", "Morph & stagger.", "animations"));

  return wrap;

  function makeSwitch(title, subtitle, key) {
    const row = document.createElement("div");
    row.style.display = "grid";
    row.style.gridTemplateColumns = "1fr auto";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    const label = document.createElement("div");
    label.innerHTML = `<strong>${title}</strong><br><small style="opacity:.75">${subtitle}</small>`;

    const toggle = document.createElement("div");
    toggle.style.width = "44px";
    toggle.style.height = "26px";
    toggle.style.borderRadius = "13px";
    toggle.style.background = "color-mix(in oklab, var(--dot-fg,#fff), transparent 85%)";
    toggle.style.position = "relative";
    toggle.style.cursor = "pointer";
    toggle.setAttribute("role", "switch");
    toggle.tabIndex = 0;

    const knob = document.createElement("div");
    knob.style.position = "absolute";
    knob.style.top = "3px";
    knob.style.left = "3px";
    knob.style.width = "20px";
    knob.style.height = "20px";
    knob.style.borderRadius = "999px";
    knob.style.background = "var(--dot-fg,#fff)";
    knob.style.transition = "transform 160ms ease";
    toggle.append(knob);

    const sync = () => {
      const on = !!prefs[key];
      toggle.setAttribute("aria-checked", String(on));
      toggle.style.background = on
        ? "color-mix(in oklab, var(--dot-fg,#fff), transparent 55%)"
        : "color-mix(in oklab, var(--dot-fg,#fff), transparent 85%)";
      knob.style.transform = on ? "translateX(18px)" : "translateX(0)";
    };

    const flip = () => {
      prefs = { ...prefs, [key]: !prefs[key] };
      savePrefs(prefs);
      applyPrefs(prefs);
      sync();
    };

    toggle.addEventListener("click", flip);
    toggle.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
    });

    sync();
    row.append(label, toggle);
    return row;
  }
}