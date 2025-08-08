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

  // === Контраст фона ===
  function updateDotContrast() {
    const bg = window.getComputedStyle(dot.parentElement).backgroundColor;
    const [r, g, b] = bg.match(/\d+/g).map(Number);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    dot.style.backgroundColor = brightness > 128 ? '#000' : '#fff';
  }

  updateDotContrast();
  window.addEventListener('resize', updateDotContrast);
  const observer = new MutationObserver(updateDotContrast);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // === Drag ===
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