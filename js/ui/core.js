// js/ui/core.js
import { logout } from "../firebase/auth.js";

export function renderTopbar(user) {
  const topbar = document.createElement("div");
  topbar.className = "top-bar";

  const left = document.createElement("div");
  left.className = "top-left";
  left.textContent = user.isAnonymous ? "Anonymous" : user.email || "User";

  const right = document.createElement("div");
  right.className = "top-right";

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "logout-btn";
  logoutBtn.title = "Logout";
  logoutBtn.innerHTML = "⇦";

  logoutBtn.onclick = async () => {
    await logout();
  };

  right.appendChild(logoutBtn);

  topbar.appendChild(left);
  topbar.appendChild(right);

  document.body.prepend(topbar);
}

export function renderDotCore() {
  const dot = document.createElement("div");
  dot.id = "dot-core";
  document.body.appendChild(dot);
}
