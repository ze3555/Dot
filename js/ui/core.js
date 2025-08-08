// js/ui/core.js

export function renderDotCore() {
  const dot = document.createElement('div');
  dot.id = 'dot-core';
  return dot;
}

export function renderTopbar() {
  const topbar = document.createElement('div');
  topbar.className = 'top-bar';
  topbar.innerHTML = `
    <div class="topbar-title">DOT</div>
    <div class="topbar-actions">
      <button id="theme-toggle-btn" aria-label="Toggle theme">🌓</button>
      <button id="logout-btn" aria-label="Logout">⎋</button>
    </div>
  `;
  return topbar;
}

export function setupDotCoreFeatures(dot) {
  if (!dot) return;

  // === Автоконтраст при изменении темы/ресайзе (без тяжёлых вычислений) ===
  function updateDotContrast() {
    const ref = dot.parentElement || document.body;
    const bg = getComputedStyle(ref).backgroundColor;
    const m = bg.match(/\d+/g);
    if (!m) return;
    const [r,g,b] = m.map(Number);
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    const hex = lum < 0.5 ? '#fff' : '#000';
    dot.style.backgroundColor = hex;
    dot.style.color = hex;
  }
  function srgb(v){ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }

  updateDotContrast();
  window.addEventListener('resize', updateDotContrast);
  const mo = new MutationObserver(updateDotContrast);
  mo.observe(document.body, { attributes:true, attributeFilter:['class'] });

  // === Bounce по клику (оставляем) ===
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dot.classList.contains('pressed')) return;
    dot.classList.add('pressed');
    setTimeout(() => dot.classList.remove('pressed'), 200);
  });

  // ВАЖНО: здесь НЕТ обработчиков mousedown/mousemove — drag только в dotCoreDrag.js
}
