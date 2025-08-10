
// Simple central state machine for DOT
const STATES = /** @type {const} */ ([
  "idle", "menu", "theme", "contacts", "settings", "function"
]);

/** @typedef {typeof STATES[number]} DotState */

const subscribers = new Set();
/** @type {DotState} */
let current = "idle";

export function getState() { return current; }

/**
 * @param {DotState} next
 * @param {{meta?: any}} [options]
 */
export function setState(next, options = {}) {
  if (next === current) return;
  if (!STATES.includes(next)) throw new Error(`Invalid state: ${next}`);
  const prev = current;
  current = next;
  subscribers.forEach(fn => fn({ prev, next, meta: options.meta }));
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export const DOT_STATES = STATES;