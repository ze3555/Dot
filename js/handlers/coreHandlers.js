export function setupDotCoreMenu() {
  const dot = document.querySelector('.dot-core');
  const menu = document.getElementById('dot-core-menu');

  if (!dot || !menu) return;

  let isOpen = false;

  dot.addEventListener('click', () => {
    isOpen = !isOpen;
    menu.classList.toggle('visible', isOpen);
  });

  // Закрытие при клике вне меню
  document.addEventListener('click', (e) => {
    if (
      isOpen &&
      !menu.contains(e.target) &&
      !dot.contains(e.target)
    ) {
      isOpen = false;
      menu.classList.remove('visible');
    }
  });
}
