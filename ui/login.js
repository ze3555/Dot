// ui/login.js
import { loginWithEmail, loginAnonymously, loginWithGoogle } from "../firebase/auth.js";

const modal = document.getElementById("login-modal");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const submitBtn = document.getElementById("login-submit");
const anonBtn = document.getElementById("anon-login");
const googleBtn = document.getElementById("google-login");

export function showLoginModal() {
  modal.classList.remove("hidden");
}

export function hideLoginModal() {
  modal.classList.add("hidden");
}

submitBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Enter email and password");

  try {
    await loginWithEmail(email, password);
    hideLoginModal();
  } catch (err) {
    alert("Login failed: " + (err.message || err));
  }
});

anonBtn?.addEventListener("click", async () => {
  try {
    await loginAnonymously();
    hideLoginModal();
  } catch (err) {
    alert("Anonymous login failed: " + (err.message || err));
  }
});

googleBtn?.addEventListener("click", async () => {
  try {
    await loginWithGoogle();
    hideLoginModal();
  } catch (err) {
    alert("Google login failed: " + (err.message || err));
  }
});