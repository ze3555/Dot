// js/ui/core.js
import { logout } from "../firebase/auth.js";

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await logout();
    };
  }
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  dot.id = "dot-core"; // на всякий случай
}
