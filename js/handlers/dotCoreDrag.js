// js/handlers/dotCoreDrag.js
// Быстрый драг (Pointer Events + rAF) + автоконтраст (ч/б) по фону.

export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  dot.style.touchAction = 'none';

  let dragging = false, pointerId = null;
  let commitLeft = null, commitTop = null;
  let latestClientX = 0, latestClientY = 0;
  let offsetX = 0, offsetY = 0;
  let dotW = 0, dotH = 0;
  let rafPending = false;
  const Z_DRAG = 2147483647;
  let prevZ = '';
  let lastIsDarkBg = null;

  function ensureFixedPosition() {
    const rect = dot.getBoundingClientRect();
    const wasFixed = getComputedStyle(dot).position === 'fixed';
    if (!wasFixed) {
      dot.style.width = rect.width + 'px';
      dot.style.height = rect.height + 'px';
    }
    dot.style.position = 'fixed';
    dot.style.left = rect.left + 'px';
    dot.style.top  = rect.top  + 'px';
    dot.style.transform = 'translate3d(0,0,0)';
    commitLeft = rect.left; commitTop = rect.top;
  }

  function clamp(x, y) {
    const pad = 6;
    const maxX = window.innerWidth  - dotW - pad;
    const maxY = window.innerHeight - dotH - pad;
    if (x < pad) x = pad; else if (x > maxX) x = maxX;
    if (y < pad) y = pad; else if (y > maxY) y = maxY;
    return [x, y];
  }

  function onPointerDown(e) {
    if (dragging || e.isPrimary === false) return;
    pointerId = e.pointerId; dot.setPointerCapture?.(pointerId);
    ensureFixedPosition();
    const rect = dot.getBoundingClientRect();
    dotW = rect.width; dotH = rect.height;
    latestClientX = e.clientX; latestClientY = e.clientY;
    offsetX = latestClientX - rect.left; offsetY = latestClientY - rect.top;
    prevZ = dot.style.zIndex; dot.style.zIndex = String(Z_DRAG);
    dot.style.willChange = 'transform'; dot.classList.add('is-dragging');
    dragging = true; rafPending = false;
    updateDotContrast(dot);
    requestAnimationFrame(tick);
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    latestClientX = e.clientX; latestClientY = e.clientY;
    if (!rafPending) { rafPending = true; requestAnimationFrame(tick); }
    e.preventDefault();
  }

  function onPointerUpOrCancel(e) {
    if (!dragging || e.pointerId !== pointerId) return;
    dot.releasePointerCapture?.(pointerId);
    dragging = false; pointerId = null;

    const transform = getComputedStyle(dot).transform;
    let tx = 0, ty = 0;
    if (transform && transform !== 'none') {
      const m = transform.match(/matrix\(([^)]+)\)/);
      if (m) {
        const p = m[1].split(',').map(n => parseFloat(n));
        if (p.length >= 6) { tx = p[4] || 0; ty = p[5] || 0; }
      }
    }
    if (tx || ty) {
      commitLeft += tx; commitTop += ty;
      dot.style.left = commitLeft + 'px'; dot.style.top = commitTop + 'px';
    }
    dot.style.transform = 'translate3d(0,0,0)';
    dot.style.willChange = ''; dot.classList.remove('is-dragging');
    dot.style.zIndex = prevZ || ''; document.body.style.userSelect = '';
    updateDotContrast(dot);
  }

  function tick() {
    rafPending = false;
    let x = latestClientX - offsetX;
    let y = latestClientY - offsetY;
    [x, y] = clamp(x, y);
    dot.style.transform = `translate3d(${x - commitLeft}px, ${y - commitTop}px, 0)`;
    updateDotContrast(dot);
    if (dragging) requestAnimationFrame(tick);
  }

  // === автоконтраст ч/б ===
  function updateDotContrast(dotEl) {
    const rect = dotEl.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width / 2);
    const cy = Math.round(rect.top + rect.height / 2);

    const prevPE = dotEl.style.pointerEvents;
    dotEl.style.pointerEvents = 'none';
    let el = document.elementFromPoint(cx, cy);
    dotEl.style.pointerEvents = prevPE;

    let rgba = null, guard = 0;
    while (el && guard++ < 20) {
      const bg = getComputedStyle(el).backgroundColor;
      const parsed = parseCssColor(bg);
      if (parsed && parsed[3] > 0) { rgba = parsed; break; }
      el = el.parentElement;
    }
    if (!rgba) rgba = [255,255,255,1];

    const [r,g,b,a] = rgba;
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    const isDark = lum < 0.5;
    if (isDark !== lastIsDarkBg) {
      lastIsDarkBg = isDark;
      const hex = isDark ? '#fff' : '#000';
      dotEl.style.color = hex;
      dotEl.style.setProperty('--dot-core-fg', hex);
      dotEl.style.setProperty('--dot-core-border', hex);
      try {
        dotEl.querySelectorAll('svg').forEach(svg => {
          svg.style.stroke = 'currentColor';
          svg.style.fill = 'currentColor';
        });
      } catch {}
    }
  }
  function srgb(v){ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
  function parseCssColor(c){
    if (!c) return null;
    if (c==='transparent') return [0,0,0,0];
    if (c.startsWith('rgb')) {
      const m=c.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+(?:\.\d+)?))?\)/i);
      if (!m) return null;
      return [parseInt(m[1],10),parseInt(m[2],10),parseInt(m[3],10), m[4]?parseFloat(m[4]):1];
    }
    if (c.startsWith('#')) {
      let h=c.slice(1); if (h.length===3) h=h.split('').map(x=>x+x).join('');
      if (h.length!==6) return null;
      return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),1];
    }
    return null;
  }

  dot.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUpOrCancel, { passive: true });
  window.addEventListener('pointercancel', onPointerUpOrCancel, { passive: true });

  // стартовый апдейт
  updateDotContrast(dot);
}