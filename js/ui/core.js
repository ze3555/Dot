// js/ui/core.js

export function renderDotCore() {
  const dot = document.createElement('div');
  dot.id = 'dot-core';

  // ===== Drag =====
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

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
      dot.style.transition = ''; // вернуть плавность
    }
  });

  // ===== Click Bounce Effect =====
  dot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dot.classList.contains('pressed')) return;

    dot.classList.add('pressed');
    setTimeout(() => dot.classList.remove('pressed'), 200);
  });

  return dot;
}
