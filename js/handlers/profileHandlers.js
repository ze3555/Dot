// js/handlers/profileHandlers.js
// Profile Top Drawer: open/close + profile actions (edit username, copy UID, add contact).
// Triggers:
//   • Mobile/tablet: swipe down starting from the very top area (top bar zone)
//   • Desktop: press "P" (when not typing in inputs)
// Depends: Firebase compat (global firebase), ./js/firebase/usernames.js
// HTML ids: #profile-top, #profile-top-backdrop, #close-profile-top,
//           #copy-id-btn, #edit-username-btn, #profile-username,
//           #add-username-input, #add-username-btn

import { normalizeUsername, setMyUsername, addContactByUsername } from "../firebase/usernames.js";

const auth = firebase.auth();
const db = firebase.firestore();

let wired = false;

export function setupProfileDrawer() {
  if (wired) return;
  wired = true;

  const drawer = document.getElementById("profile-top");
  const backdrop = document.getElementById("profile-top-backdrop");
  const closeBtn = document.getElementById("close-profile-top");
  const copyIdBtn = document.getElementById("copy-id-btn");
  const editUsernameBtn = document.getElementById("edit-username-btn");
  const unameChip = document.getElementById("profile-username");
  const addUsernameBtn = document.getElementById("add-username-btn");
  const addUsernameInput = document.getElementById("add-username-input");
  const dot = document.querySelector(".dot-core");
  const topBar = document.querySelector(".top-bar");

  if (!drawer || !backdrop) return;

  function isOpen() { return drawer.classList.contains("open"); }
  function open() {
    if (isOpen()) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    populate();
  }
  function close() {
    if (!isOpen()) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  async function populate() {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const snap = await db.doc(`users/${user.uid}`).get();
      const data = snap.exists ? snap.data() : null;
      const uname = data?.username || data?.usernameLower || "";
      if (unameChip) unameChip.textContent = uname || "—";
      const avatar = drawer.querySelector(".avatar");
      if (avatar) {
        const initial = (user.displayName?.[0] || uname?.[0] || user.email?.[0] || "U").toUpperCase();
        avatar.textContent = initial;
      }
    } catch (e) {
      console.error("populate profile error:", e);
    }
  }

  // === Controls ===
  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  copyIdBtn?.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;
    try { await navigator.clipboard.writeText(user.uid); toast("ID copied"); }
    catch { prompt("Copy your ID:", user.uid); }
  });

  editUsernameBtn?.addEventListener("click", async () => {
    const current = unameChip?.textContent?.trim() || "";
    const next = prompt("Set username (3–20, a–z, 0–9, _):", current);
    if (next == null) return;
    try {
      const u = await setMyUsername(next);
      if (unameChip) unameChip.textContent = u;
      toast("Username updated");
    } catch (e) {
      toast(e?.message || "Failed to set username");
    }
  });

  addUsernameBtn?.addEventListener("click", async () => {
    const val = normalizeUsername(addUsernameInput?.value || "");
    if (!val) return;
    addUsernameBtn.disabled = true;
    try {
      const res = await addContactByUsername(val);
      if (res?.status === "added") { toast("Contact added"); addUsernameInput.value = ""; }
      else if (res?.status === "already") { toast("Already in contacts"); }
      else { toast("Not found"); }
    } catch (e) {
      toast(e?.message || "Failed to add");
    } finally {
      addUsernameBtn.disabled = false;
    }
  });

  // === Triggers ===

  // 1) Mobile/tablet: swipe down starting near the very top edge (top bar area).
  //    We intentionally *do not* use full-screen swipe; it must start in the top zone.
  const TOP_ZONE_PX = Math.max(48, (topBar?.offsetHeight || 64)); // ~top bar height
  const SWIPE_MIN_Y = 60;   // required vertical distance
  const SWIPE_MAX_X = 40;   // keep mostly vertical
  const MAX_DURATION = 700; // ms

  let tStartX = 0, tStartY = 0, tLastX = 0, tLastY = 0, t0 = 0, tracking = false;

  function onTouchStart(e) {
    if (isOpen()) return; // не перехватываем, если уже открыто
    const t = e.touches?.[0];
    if (!t) return;

    // старт только из верхней зоны или из элемента .top-bar
    const fromTopZone = t.clientY <= TOP_ZONE_PX || (e.target && e.target.closest(".top-bar"));
    const onDot = e.target && e.target.closest(".dot-core");
    if (!fromTopZone || onDot) return; // не конфликтуем с драгом Дота

    tracking = true;
    tStartX = tLastX = t.clientX;
    tStartY = tLastY = t.clientY;
    t0 = Date.now();
  }

  function onTouchMove(e) {
    if (!tracking) return;
    const t = e.touches?.[0];
    if (!t) return;
    tLastX = t.clientX;
    tLastY = t.clientY;

    const dx = tLastX - tStartX;
    const dy = tLastY - tStartY;

    // если явное вертикальное движение вниз — блокируем браузерный "резиновый" скролл
    if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) && dy > 0) {
      // listener зарегистрирован с {passive:false}
      e.preventDefault();
    }
  }

  function onTouchEnd() {
    if (!tracking) return;
    const dt = Date.now() - t0;
    const dx = tLastX - tStartX;
    const dy = tLastY - tStartY;

    if (dy >= SWIPE_MIN_Y && Math.abs(dx) <= SWIPE_MAX_X && dt <= MAX_DURATION) {
      open();
    }
    tracking = false;
  }

  window.addEventListener("touchstart", onTouchStart, { passive: true });
  // move нужен непассивный, чтобы иметь право preventDefault
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  // 2) Desktop: press "P" (when not typing in inputs).
  window.addEventListener("keydown", (e) => {
    // ignore when typing or with modifiers
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    // contenteditable?
    if (e.target && /** @type {HTMLElement} */(e.target).isContentEditable) return;

    if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      open();
    }
  });

  // (No double-click trigger; Function is reserved for another feature)

  // Debug helpers
  window.__profileDrawer = { open, close, populate };
}

function toast(msg) {
  try {
    let el = document.getElementById("__toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "__toast";
      el.style.position = "fixed";
      el.style.top = "10px";
      el.style.left = "50%";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "8px 12px";
      el.style.borderRadius = "10px";
      el.style.fontSize = "13px";
      el.style.zIndex = "100001";
      el.style.background = "rgba(0,0,0,0.8)";
      el.style.color = "#fff";
      el.style.pointerEvents = "none";
      el.style.transition = "opacity 150ms ease";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(el.__t);
    el.__t = setTimeout(() => el.style.opacity = "0", 1600);
  } catch { alert(msg); }
}
