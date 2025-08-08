// js/ui/core.js
// Лёгкая корректировка автоконтраста: тоже красим и фон, и цвет.

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

  // === Контраст фона (момент старта/ресайз/смена класса body) ===
  function updateDotContrast() {
    const parent = dot.parentElement || document.body;
    const bg = window.getComputedStyle(parent).backgroundColor;
    const nums = bg.match(/\d+/g);
    if (!nums) return;
    const [r, g, b] = nums.map(Number);
    const lum = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
    const hex = lum < 0.5 ? '#fff' : '#000';
    dot.style.backgroundColor = hex;
    dot.style.color = hex;
  }

  function srgb(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  updateDotContrast();
  window.addEventListener('resize', updateDotContrast);
  const observer = new MutationObserver(updateDotContrast);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // === Простой drag из этого файла оставляем как было (если нужен) ===
  let offsetX = 0, offsetY = 0, isDragging = false;

  dot.addEventListener('mousedown', (e) => {
    e.preventDefault();
    offsetX = e.clientX - dot.getBoundingClientRect().left;
    offsetY = e.clientY - dot.getBoundingClientRect().top;
    isDragging = true;
    dot.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      dot.style.transition = '';
    }
  });

  // === Bounce по клику ===
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dot.classList.contains('pressed')) return;
    dot.classList.add('pressed');
    setTimeout(() => dot.classList.remove('pressed'), 200);
  });
}
