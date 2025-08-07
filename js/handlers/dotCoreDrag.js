export function enableDotCoreDrag() {
  const dot = document.querySelector('.dot-core');
  if (!dot) return;

  let offsetX = 0, offsetY = 0;
  let isDragging = false;
  let dragReady = false;
  let holdTimer = null;

  // Центрируем DotCore по умолчанию
  dot.style.position = "fixed";
  dot.style.top = "50%";
  dot.style.left = "50%";
  dot.style.transform = "translate(-50%, -50%)";
  dot.style.transition = "top 0.25s, left 0.25s, transform 0.25s";

  // --- Drag с задержкой ---
  dot.addEventListener('mousedown', (e) => {
    holdTimer = setTimeout(() => {
      dragReady = true;
      isDragging = true;
      // Отключаем transform для корректного drag
      const rect = dot.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      // Считаем реальные координаты в документе
      dot.style.top = rect.top + "px";
      dot.style.left = rect.left + "px";
      dot.style.transform = ""; // Отключаем transform!
      document.body.style.userSelect = "none";
    }, 400);
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

  dot.addEventListener('touchstart', (e) => {
    holdTimer = setTimeout(() => {
      dragReady = true;
      isDragging = true;
      const touch = e.touches[0];
      const rect = dot.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      dot.style.top = rect.top + "px";
      dot.style.left = rect.left + "px";
      dot.style.transform = "";
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

  // --- Вернуть в центр двойным кликом ---
  dot.addEventListener('dblclick', () => {
    dot.style.top = "50%";
    dot.style.left = "50%";
    dot.style.transform = "translate(-50%, -50%)";
  });
}