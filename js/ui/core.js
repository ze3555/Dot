import { logout } from "../firebase/auth.js";
import { setTheme, initTheme } from "../theme/index.js"; // добавляем импорт

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  const themeBtn = document.getElementById("btn-theme"); // ищем кнопку

  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await logout();
    };
  }

  if (themeBtn) {
    themeBtn.onclick = () => {
      const nextTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
      setTheme(nextTheme);
    };
  }
}

// вызывать при старте
export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  dot.id = "dot-core"; // на всякий случай

  // инициализация темы при загрузке UI
  initTheme();
}
