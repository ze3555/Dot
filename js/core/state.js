const KEY = "dot_prefs_v1";
const defaults = { dragEnabled: false, lowGlow: false, snapOnClose: true };
let state = load();

function load() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch { return { ...defaults }; }
}
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

export function getState() { return state; }
export function setState(patch) { state = { ...state, ...patch }; save(); }
