// js/handlers/swipeHandlers.js
// Contacts drawer: edge-swipe only (from left edge), horizontal, below top-bar.
// Gesture-lock чтобы не конфликтовать с профилем.

let WIRED = false;

export function setupSwipeHandlers() {
  if (WIRED) return;
  WIRED = true;

  const drawer = document.getElementById("contacts-drawer");
  const backdrop =
    document.getElementById("contacts-backdrop") ||
    document.getElementById("contacts-drawer-backdrop") ||
    document.querySelector(".contacts-drawer-backdrop");

  if (!drawer || !backdrop) {
    console.warn("[ContactsSwipe] missing drawer/backdrop");
    return;
  }

  function isOpen() { return drawer.classList.contains("open"); }
  function open() {
    if (isOpen()) return;
    drawer.classList.add("open");
    backdrop.classList.add("open");
    document.body.classList.add("no-scroll");
  }
  function close() {
    if (!isOpen()) return;
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  // Close UX
  backdrop.addEventListener("click", close);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // Gesture config
  const topBar = document.querySelector(".top-bar");
  const TOP_Y = Math.max(48, (topBar?.offsetHeight || 64));
  const EDGE_X = 20;   // старт только из левой кромки
  const MIN_X  = 60;   // порог открытия
  const ANGLE  = 1.4;  // |dx| > 1.4 * |dy|
  const MAX_DT = 800;  // мс

  let track = false, claim = false, x0 = 0, y0 = 0, x = 0, y = 0, t0 = 0;

  function reset() { track = false; claim = false; }

  function onStart(e) {
    if (isOpen()) return;
    const t = e.touches?.[0]; if (!t) return;

    const fromEdge = t.clientX <= EDGE_X;
    const belowTop = t.clientY > TOP_Y + 4;
    if (!fromEdge || !belowTop) { reset(); return; }

    // Игнорируем тач на элементах, где не хотим жестов
    if (e.target?.closest(".dot-core, .profile-top-drawer, .profile-top-backdrop")) { reset(); return; }

    track = true; claim = false;
    x0 = x = t.clientX; y0 = y = t.clientY; t0 = Date.now();
  }

  function onMove(e) {
    if (!track) return;
    const t = e.touches?.[0]; if (!t) return;
    x = t.clientX; y = t.clientY;

    const dx = x - x0, dy = y - y0;

    if (!claim && Math.abs(dy) > Math.abs(dx) * ANGLE) { reset(); return; }

    if (!claim && dx > 10 && Math.abs(dx) > Math.abs(dy)) {
      claim = true;
      e.preventDefault(); // блокируем скролл
      window.__gestureLock = "contacts";
      document.body.classList.add("gesture-contacts");
    }

    if (claim) e.preventDefault();
  }

  function onEnd() {
    if (!track) return;
    const dt = Date.now() - t0, dx = x - x0, dy = y - y0;

    if (claim && dx >= MIN_X && Math.abs(dx) > Math.abs(dy) / 1.1 && dt <= MAX_DT) open();

    reset();
    setTimeout(() => {
      if (window.__gestureLock === "contacts") {
        window.__gestureLock = null;
        document.body.classList.remove("gesture-contacts");
      }
    }, 0);
  }

  window.addEventListener("touchstart", onStart, { passive: true });
  window.addEventListener("touchmove",  onMove,  { passive: false });
  window.addEventListener("touchend",   onEnd,   { passive: true });

  // Debug
  window.__contactsDrawer = { open, close, isOpen };
}

// Алиас под импорт из main.js
export function setupSwipeDrawer() { return setupSwipeHandlers(); }