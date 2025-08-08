// js/handlers/themeHandlers.js
import { initTheme } from "../theme/index.js";

/** Apply saved theme at startup */
export function initializeThemeOnStart() {
  initTheme();
}

/* NOTE:
   Old topbar toggle is deprecated/removed by design.
   Theme is toggled ONLY from the Dot expansion panel now. */
