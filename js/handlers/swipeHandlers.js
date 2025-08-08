// js/handlers/swipeHandlers.js
// Contacts drawer: открывается ТОЛЬКО edge-swipe с левого края, горизонтально и ниже топ-бара.
// Вводим gesture-lock, чтобы не конфликтовать с профилем.

(function () {
  'use strict';

  let wired = false;

  function setupSwipeHandlers() {
    if (wired) return;
    wired = true;

    const drawer = document.getElementById('contacts-drawer');
    const backdrop = document.querySelector('.contacts-drawer-backdrop');
    if (!drawer || !backdrop) { console.warn('[ContactsSwipe] missing drawer/backdrop'); return; }

    function isOpen() { return drawer.classList.contains('open'); }
    function open() {
      if (isOpen()) return;
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('no-scroll');
    }
    function close() {
      if (!isOpen()) return;
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('no-scroll');
    }

    // Close UX
    backdrop.addEventListener('click', close);
    window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    // Gesture config
    const topBar = document.querySelector('.top-bar');
    const TOP_Y = Math.max(48, (topBar && topBar.offsetHeight) || 64);
    const EDGE_X = 20;
    const MIN_X  = 60;
    const ANGLE  = 1.4;
    const MAX_DT = 800;

    let track = false, claim = false, x0 = 0, y0 = 0, x = 0, y = 0, t0 = 0;

    function reset() { track = false; claim = false; }

    function onStart(e) {
      if (isOpen()) return;
      const t = e.touches && e.touches[0]; if (!t) return;
      const fromEdge = t.clientX <= EDGE_X;
      const belowTop = t.clientY > TOP_Y + 4;
      if (!fromEdge || !belowTop) { reset(); return; }
      if (e.target && (e.target.closest('.dot-core') || e.target.closest('.profile-top-drawer') || e.target.closest('.profile-top-backdrop'))) {
        reset(); return;
      }
      track = true; claim = false;
      x0 = x = t.clientX; y0 = y = t.clientY; t0 = Date.now();
    }

    function onMove(e) {
      if (!track) return;
      const t = e.touches && e.touches[0]; if (!t) return;
      x = t.clientX; y = t.clientY;
      const dx = x - x0, dy = y - y0;

      if (!claim && Math.abs(dy) > Math.abs(dx) * ANGLE) { reset(); return; }
      if (!claim && dx > 10 && Math.abs(dx) > Math.abs(dy)) {
        claim = true;
        e.preventDefault(); // блокируем скролл страницы
        window.__gestureLock = 'contacts';
        document.body.classList.add('gesture-contacts');
      }
      if (claim) e.preventDefault();
    }

    function onEnd() {
      if (!track) return;
      const dt = Date.now() - t0, dx = x - x0, dy = y - y0;
      if (claim && dx >= MIN_X && Math.abs(dx) > Math.abs(dy) / 1.1 && dt <= MAX_DT) open();
      reset();
      setTimeout(() => {
        if (window.__gestureLock === 'contacts') {
          window.__gestureLock = null;
          document.body.classList.remove('gesture-contacts');
        }
      }, 0);
    }

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove',  onMove,  { passive: false });
    window.addEventListener('touchend',   onEnd,   { passive: true });

    // Debug
    window.__contactsDrawer = { open, close, isOpen };
    console.debug('[ContactsSwipe] wired');
  }

  window.setupSwipeHandlers = setupSwipeHandlers;
  try { setupSwipeHandlers(); } catch (e) { console.error('[ContactsSwipe] setup error:', e); }
})();