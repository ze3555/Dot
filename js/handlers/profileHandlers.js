// js/handlers/profileHandlers.js
// Profile Top Drawer: open/close + profile actions (edit username, copy UID, add contact).
// Triggers: swipe-down from top zone (mobile), "P" hotkey (desktop)

import { normalizeUsername, setMyUsername, addContactByUsername } from "../firebase/usernames.js";

// Lazy getters — чтобы не падать, если firebase ещё не готов
function $auth() { return window.firebase?.auth(); }
function $db()   { return window.firebase?.firestore(); }

let wired = false;

export function setupProfileDrawer() {
  if (wired) return;
  wired = true;

  // === Ensure DOM (auto-mount) ==============================================
  let drawer = document.getElementById("profile-top");
  let backdrop = document.getElementById("profile-top-backdrop");

  if (!drawer) {
    drawer = document.createElement("aside");
    drawer.id = "profile-top";
    drawer.className = "profile-top-drawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = `
      <div class="profile-grabber" aria-hidden="true"></div>
      <div class="profile-sheet-scroll">
        <header class="profile-header">
          <div class="avatar" aria-hidden="true">P</div>
          <div class="user-meta">
            <div class="username-row">
              <span id="profile-username" class="username-chip">—</span>
              <button id="edit-username-btn" class="profile-action">Edit</button>
            </div>
            <button id="copy-id-btn" class="profile-action subtle">Copy ID</button>
          </div>
          <button id="close-profile-top" class="profile-action subtle" aria-label="Close">Close</button>
        </header>

        <section class="profile-section">
          <label class="section-title">Contacts</label>
          <div class="add-username-row">
            <input id="add-username-input" class="profile-input" type="text"
                   placeholder="Add by username" autocomplete="off" />
            <button id="add-username-btn" class="profile-action">Add</button>
          </div>
        </section>
      </div>
    `;
    document.body.appendChild(drawer);
  } else {
    // Вёрстка есть — добавим кромку, если её нет
    if (!drawer.querySelector(".profile-grabber")) {
      const grabber = document.createElement("div");
      grabber.className = "profile-grabber";
      grabber.setAttribute("aria-hidden", "true");
      drawer.prepend(grabber);
    }
  }

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "profile-top-backdrop";
    backdrop.className = "profile-top-backdrop";
    document.body.appendChild(backdrop);
  }

  // === Elements & helpers ====================================================
  const closeBtn = drawer.querySelector("#close-profile-top");
  const copyIdBtn = drawer.querySelector("#copy-id-btn");
  const editUsernameBtn = drawer.querySelector("#edit-username-btn");
  const unameChip = drawer.querySelector("#profile-username");
  const addUsernameBtn = drawer.querySelector("#add-username-btn");
  const addUsernameInput = drawer.querySelector("#add-username-input");
  const topBar = document.querySelector(".top-bar");

  function isOpen() { return drawer.classList.contains("open"); }
  function open() {
    if (isOpen()) return;
    drawer.classList.add("open");
    backdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    populate();
  }
  function close() {
    if (!isOpen()) return;
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  async function populate() {
    const auth = $auth();
    const db = $db();
    const user = auth?.currentUser;
    if (!user || !db) return;
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
    } catch (e) { console.error("populate profile error:", e); }
  }

  // === Controls ==============================================================
  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  copyIdBtn?.addEventListener("click", async () => {
    const user = $auth()?.currentUser;
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
    } catch (e) { toast(e?.message || "Failed to set username"); }
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
    } catch (e) { toast(e?.message || "Failed to add"); }
    finally { addUsernameBtn.disabled = false; }
  });

  // === Triggers: swipe-down (mobile) + "P" (desktop) =========================
  const TOP_ZONE_PX = Math.max(48, (topBar?.offsetHeight || 64));
  const SWIPE_MIN_Y = 50;  // мягче
  const SWIPE_MAX_X = 60;  // допускаем диагональ
  const MAX_DURATION = 800;

  let tStartX = 0, tStartY = 0, tLastX = 0, tLastY = 0, t0 = 0, tracking = false;

  function onTouchStart(e) {
    if (isOpen()) return;
    const t = e.touches?.[0]; if (!t) return;

    const fromTopZone = t.clientY <= TOP_ZONE_PX || (e.target && e.target.closest(".top-bar"));
    const onDot = e.target && e.target.closest(".dot-core");
    if (!fromTopZone || onDot) return;

    tracking = true;
    tStartX = tLastX = t.clientX;
    tStartY = tLastY = t.clientY;
    t0 = Date.now();
  }
  function onTouchMove(e) {
    if (!tracking) return;
    const t = e.touches?.[0]; if (!t) return;
    tLastX = t.clientX; tLastY = t.clientY;

    const dx = tLastX - tStartX;
    const dy = tLastY - tStartY;
    if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) && dy > 0) e.preventDefault();
  }
  function onTouchEnd() {
    if (!tracking) return;
    const dt = Date.now() - t0;
    const dx = tLastX - tStartX;
    const dy = tLastY - tStartY;
    if (dy >= SWIPE_MIN_Y && Math.abs(dx) <= SWIPE_MAX_X && dt <= MAX_DURATION) open();
    tracking = false;
  }

  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.target && /** @type {HTMLElement} */(e.target).isContentEditable) return;
    if (e.key === "p" || e.key === "P") { e.preventDefault(); open(); }
  });

  // Debug
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
