// js/handlers/themeHandlers.js
import { initTheme } from "../theme/index.js";

/** Apply saved theme at startup */
export function initializeThemeOnStart() {
  initTheme();
}

/* Note:
   Legacy topbar theme toggle is removed by design.
   Theme is toggled ONLY from the Dot expansion panel now. */
