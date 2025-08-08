// js/handlers/dotCoreDrag.js
//
// High-performance drag for .dot-core using Pointer Events + rAF.
// Goals:
//  • Instant finger tracking (no lag, no jank)
//  • Zero layout thrashing (transform-only during drag)
//  • No accidental page scroll (touch-action: none)
//  • Safe within viewport (clamped), restores styles after drop
//
// Public API: enableDotCoreDrag()

export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  // Ensure the element is ready for pointer drag on all devices.
  // We set touch-action at runtime in case CSS wasn't updated yet.
  dot.style.touchAction = 'none';

  // Internal state
  let dragging = false;
  let pointerId = null;

  // Visual position committed to style.left/top (fixed coords)
  let commitLeft = null;
  let commitTop  = null;

  // Latest pointer client coords (source of truth during drag)
  let latestClientX = 0;
  let latestClientY = 0;

  // Offset from pointer to the dot's visual top-left
  let offsetX = 0;
  let offsetY = 0;

  // Cached size of the dot (avoid repeated getBoundingClientRect in move)
  let dotW = 0, dotH = 0;

  // rAF loop control
  let rafId = 0;
  let rafPending = false;

  // z-index management so the dot stays on top while dragging
  const Z_DRAG = 2147483647; // max-ish
  let prevZ = '';

  // Convert current visual position to fixed left/top, once, then move via transform during drag
  function ensureFixedPosition() {
    const rect = dot.getBoundingClientRect();
    // If the element is not position:fixed, switch while preserving visual position.
    const computed = getComputedStyle(dot);
    const wasFixed = computed.position === 'fixed';

    if (!wasFixed) {
      // Preserve width/height so switching to fixed doesn't reflow size
      dot.style.width = rect.width + 'px';
      dot.style.height = rect.height + 'px';
    }

    dot.style.position = 'fixed';
    dot.style.left = rect.left + 'px';
    dot.style.top  = rect.top  + 'px';

    // Reset any previous transform that might have been applied
    dot.style.transform = 'translate3d(0,0,0)';

    commitLeft = rect.left;
    commitTop  = rect.top;
  }

  // Clamp within viewport with a small padding
  function clampToViewport(x, y) {
    const pad = 6;
    const maxX = window.innerWidth  - dotW - pad;
    const maxY = window.innerHeight - dotH - pad;
    if (x < pad) x = pad;
    else if (x > maxX) x = maxX;
    if (y < pad) y = pad;
    else if (y > maxY) y = maxY;
    return [x, y];
  }

  function onPointerDown(e) {
    // Only primary button / primary touch
    if (dragging || (e.isPrimary === false)) return;

    pointerId = e.pointerId;
    dot.setPointerCapture?.(pointerId);

    // Prepare fixed positioning and cache sizes
    ensureFixedPosition();
    const rect = dot.getBoundingClientRect();
    dotW = rect.width;
    dotH = rect.height;

    // Calculate offset so the dot sticks under the finger exactly where it was grabbed
    latestClientX = e.clientX;
    latestClientY = e.clientY;
    offsetX = latestClientX - rect.left;
    offsetY = latestClientY - rect.top;

    // Visual prep for smoothness
    prevZ = dot.style.zIndex;
    dot.style.zIndex = String(Z_DRAG);
    dot.style.willChange = 'transform';
    // No transform transitions during drag, keep other transitions intact
    dot.classList.add('is-dragging');

    dragging = true;
    rafPending = false;

    // Start RAF loop immediately to avoid any frame of "stuck" visual
    tick();

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';

    // Prevent pull-to-refresh / page scroll on some Androids
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== pointerId) return;

    latestClientX = e.clientX;
    latestClientY = e.clientY;

    if (!rafPending) {
      rafPending = true;
      rafId = requestAnimationFrame(tick);
    }

    // Stop the page from scrolling while dragging
    e.preventDefault();
  }

  function onPointerUpOrCancel(e) {
    if (!dragging || e.pointerId !== pointerId) return;

    dot.releasePointerCapture?.(pointerId);
    pointerId = null;
    dragging = false;

    // Commit the final position by folding the transform into left/top
    const transform = getComputedStyle(dot).transform;
    // Extract translate from matrix(a,b,c,d,tx,ty)
    let tx = 0, ty = 0;
    if (transform && transform !== 'none') {
      const m = transform.match(/matrix\(([^)]+)\)/);
      if (m) {
        const parts = m[1].split(',').map(s => parseFloat(s));
        if (parts.length >= 6) {
          tx = parts[4] || 0;
          ty = parts[5] || 0;
        }
      }
    }
    if (tx || ty) {
      commitLeft += tx;
      commitTop  += ty;
      dot.style.left = commitLeft + 'px';
      dot.style.top  = commitTop + 'px';
    }
    // Reset transform so future layouts are clean
    dot.style.transform = 'translate3d(0,0,0)';
    dot.style.willChange = '';

    // Restore styles
    dot.classList.remove('is-dragging');
    dot.style.zIndex = prevZ || '';
    document.body.style.userSelect = '';

    // One last contrast update if the project uses dynamic contrast
    try { updateDotContrast(dot); } catch (_) {}
  }

  function tick() {
    rafPending = false;

    // Desired top/left from pointer position minus offset
    let x = latestClientX - offsetX;
    let y = latestClientY - offsetY;

    // Clamp to viewport
    [x, y] = clampToViewport(x, y);

    // Translate relative to committed left/top (transform-only; no layout)
    const dx = x - commitLeft;
    const dy = y - commitTop;
    dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;

    // Queue next frame if still dragging
    if (dragging) {
      rafId = requestAnimationFrame(tick);
    }
  }

  // Optional: dynamic contrast based on background under the dot center.
  // Kept lightweight and resilient; if you don't need it, remove calls above.
  function updateDotContrast(dotEl) {
    const rect = dotEl.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);

    // Temporarily disable hit-test so elementFromPoint can "see behind" the dot
    const prev = dotEl.style.pointerEvents;
    dotEl.style.pointerEvents = 'none';
    const behind = document.elementFromPoint(cx, cy);
    dotEl.style.pointerEvents = prev;

    if (!behind) return;

    const bg = getComputedStyle(behind).backgroundColor;
    if (!bg || bg === 'transparent') return;

    // Parse rgba/hex named colors roughly into luminance
    const rgb = parseCssColor(bg);
    if (!rgb) return;

    const [r, g, b, a] = rgb;
    // WCAG-ish luminance
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    // Flip border for dark backgrounds for better visibility
    if (lum < 0.5 && a > 0) {
      dotEl.style.setProperty('--dot-core-border', '#fff');
    } else {
      dotEl.style.setProperty('--dot-core-border', '#000');
    }
  }

  // Helpers
  function srgb(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function parseCssColor(color) {
    // rgb(a) or hex only – keep it tiny
    if (color.startsWith('rgb')) {
      const m = color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+(?:\.\d+)?))?\)/i);
      if (!m) return null;
      return [parseInt(m[1],10), parseInt(m[2],10), parseInt(m[3],10), m[4] ? parseFloat(m[4]) : 1];
    }
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      if (hex.length !== 6) return null;
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);
      return [r,g,b,1];
    }
    return null;
  }

  // Attach listeners (Pointer Events work across mouse/touch/pen)
  dot.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUpOrCancel, { passive: true });
  window.addEventListener('pointercancel', onPointerUpOrCancel, { passive: true });

  // Initial contrast update once on load + resize/scroll to keep it correct
  try { updateDotContrast(dot); } catch (_) {}
  window.addEventListener('resize', () => { try { updateDotContrast(dot); } catch (_) {} });
  window.addEventListener('scroll',  () => { try { updateDotContrast(dot); } catch (_) {} });
}