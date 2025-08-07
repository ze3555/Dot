export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  let offsetX = 0, offsetY = 0;
  let isDragging = false;
  let dragReady = false;
  let holdTimer = null;

  // Перевести DotCore в fixed
  dot.style.position = "fixed";

  // ПК мышка
  dot.addEventListener('mousedown', (e) => {
    holdTimer = setTimeout(() => {
      dragReady = true;
      isDragging = true;
      const rect = dot.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      document.body.style.userSelect = "none";
    }, 400); // 400 мс задержка для “hold”
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !dragReady) return;
    dot.style.top = (e.clientY - offsetY) + "px";
    dot.style.left = (e.clientX - offsetX) + "px";
  });

  document.addEventListener('mouseup', () => {
    clearTimeout(holdTimer);
    isDragging = false;
    dragReady = false;
    document.body.style.userSelect = "";
  });

  // Тач-устройства
  dot.addEventListener('touchstart', (e) => {
    holdTimer = setTimeout(() => {
      dragReady = true;
      isDragging = true;
      const touch = e.touches[0];
      const rect = dot.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      document.body.style.userSelect = "none";
    }, 400);
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || !dragReady) return;
    e.preventDefault();
    const touch = e.touches[0];
    dot.style.top = (touch.clientY - offsetY) + "px";
    dot.style.left = (touch.clientX - offsetX) + "px";
  }, { passive: false });

  document.addEventListener('touchend', () => {
    clearTimeout(holdTimer);
    isDragging = false;
    dragReady = false;
    document.body.style.userSelect = "";
  });
}