/** Small popover with quick tools (pinned/recent) */
export function renderQuickTools({ onPick } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "dot-popover__grid";

  const tools = [
    { key: "chatgpt", label: "ChatGPT" },
    { key: "steam",   label: "Steam"   },
    // при желании добавим сюда ещё 1-2
  ];

  tools.forEach(t => {
    const b = document.createElement("button");
    b.className = "dot-popover__btn";
    b.type = "button";
    b.textContent = t.label;
    b.addEventListener("click", () => onPick?.(t.key));
    wrap.append(b);
  });

  return wrap;
}