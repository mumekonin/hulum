export const THEME_KEY = "hulum.theme";
export const THEME_EVENT = "hulum:theme";

/**
 * Runs inline in <head> before first paint so the page never flashes the wrong theme.
 * An explicit stored choice wins; otherwise the OS preference.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;
