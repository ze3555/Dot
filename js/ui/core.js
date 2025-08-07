// js/ui/core.js
import { setupDotMoveOnInput } from "../handlers/dotMoveHandler.js";

export function renderTopbar(user) {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.style.display = user ? "block" : "none";
  }
  // Кнопка контактов и её обработчик полностью убраны
}

export function renderDotCore() {
  const dot = document.querySelector(".dot-core");
  if (!dot) return;

  dot.id = "dot-core";
}

// === Инициализация dot-core "магнитика" ===
export function setupDotCoreFeatures() {
  setupDotMoveOnInput();
}