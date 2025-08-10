
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Replace node contents safely */
export function mount(host, node) {
  host.textContent = "";
  host.appendChild(node);
}