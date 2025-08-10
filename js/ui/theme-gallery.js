import { applyTheme } from "../services/theme.js";

/** Creates a small grid of theme tiles */
export function renderThemeGallery({ onPicked } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "dot-popover__grid";

  const row = document.createElement("div");
  row.className = "dot-popover__row";

  const tLight = document.createElement("button");
  tLight.className = "dot-popover__tile tile-light";
  tLight.textContent = "Light";

  const tDark = document.createElement("button");
  tDark.className = "dot-popover__tile tile-dark";
  tDark.textContent = "Dark";

  row.append(tLight, tDark);
  wrap.append(row);

  const pick = (name) => {
    applyTheme(name);
    onPicked?.(name);
  };

  tLight.addEventListener("click", () => pick("light"));
  tDark.addEventListener("click", () => pick("dark"));

  return wrap;
}