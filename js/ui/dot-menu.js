// js/ui/contacts.js
// Renders contacts list inside the left drawer and wires the "+" button to open Profile drawer.
// Firebase: uses global compat (window.firebase)

let _unsub = null;

const auth = () => window.firebase?.auth?.();
const db   = () => window.firebase?.firestore?.();

export function setupContactsUI() {
  const drawer = document.getElementById("contacts-drawer");
  if (!drawer) return;

  // --- Ensure header with "+" button and list container
  let header = drawer.querySelector(".contacts-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "contacts-header";
    // располагаем вверху панели
    drawer.prepend(header);
  }

  let addBtn = header.querySelector(".drawer-add-btn");
  if (!addBtn) {
    addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "drawer-add-btn";
    addBtn.textContent = "+"; // стиль берётся из CSS
    header.appendChild(addBtn);
  }

  let list = drawer.querySelector("#contacts-list");
  if (!list) {
    list = document.createElement("ul");
    list.id = "contacts-list";
    list.className = "contacts-list";
    // ставим список сразу под header, перед остальным контентом
    header.insertAdjacentElement("afterend", list);
  }

  // --- Click: "+" opens Profile drawer (no duplication of fields)
  addBtn.addEventListener("click", () => {
    // профиль автосмонтирован в profileHandlers.js
    if (window.__profileDrawer?.open) {
      window.__profileDrawer.open();
    } else {
      // запасной вариант — бежим ленивым импортом
      import("../handlers/profileHandlers.js")
        .then(m => m.setupProfileDrawer?.())
        .then(() => window.__profileDrawer?.open?.())
        .catch(() => {});
    }
  });

  // --- Click: contact item → fire app-level event (router/чат откроет беседу)
  list.addEventListener("click", (e) => {
    const item = /** @type {HTMLElement} */(e.target).closest(".contact-item");
    if (!item) return;
    const uid = item.getAttribute("data-uid");
    if (!uid) return;

    const ev = new CustomEvent("open:chat", { detail: { uid } });
    document.dispatchEvent(ev);

    // UX: закрываем левый дроуэр (если у вас есть такой хелпер)
    window.__contactsDrawer?.close?.();
  });

  // --- Subscribe to current user's contacts
  resubscribe(list);

  // Also re-wire on auth change
  auth()?.onAuthStateChanged(() => resubscribe(list));
}

function resubscribe(listEl) {
  try { _unsub?.(); } catch {}

  const a = auth();
  const d = db();
  const me = a?.currentUser;
  if (!d || !me) {
    // empty state
    renderList(listEl, []);
    return;
  }

  // без сортировки (чтобы не требовать индексы). при желании можно добавить orderBy('createdAt','desc')
  const col = d.collection("users").doc(me.uid).collection("contacts");
  _unsub = col.onSnapshot(async (snap) => {
    const entries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Hydrate with profile info
    const enriched = await hydrateUsers(entries.map(x => x.contactUid || x.id));
    renderList(listEl, enriched);
  }, (err) => {
    console.error("[contacts] snapshot error:", err);
  });
}

async function hydrateUsers(uids = []) {
  const d = db(); if (!d || !uids.length) return [];
  // батчим запросы пользователей (простая последовательность; можно оптимизировать на кеш)
  const results = await Promise.all(uids.map(async (uid) => {
    try {
      const snap = await d.doc(`users/${uid}`).get();
      const data = snap.exists ? snap.data() : {};
      return {
        uid,
        username: data?.username || data?.usernameLower || "",
        displayName: data?.displayName || "",
      };
    } catch {
      return { uid, username: "", displayName: "" };
    }
  }));
  return results;
}

function renderList(listEl, users) {
  if (!listEl) return;

  if (!users.length) {
    listEl.innerHTML = `
      <li class="contacts-empty">No contacts yet</li>
    `;
    return;
  }

  const html = users.map(u => {
    const name = u.displayName || u.username || shortUid(u.uid);
    const initial = (name?.[0] || "U").toUpperCase();
    return `
      <li class="contact-item" data-uid="${u.uid}">
        <div class="contact-avatar" aria-hidden="true">${initial}</div>
        <div class="contact-meta">
          <div class="contact-name">${escapeHtml(name)}</div>
        </div>
      </li>
    `;
  }).join("");

  listEl.innerHTML = html;
}

function shortUid(uid) { return uid ? uid.slice(0, 6) + "…" : "—"; }

function escapeHtml(s) {
  return String(s)
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
