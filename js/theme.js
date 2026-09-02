/* ============================= THEME SWITCHING ============================= */
// Colors/fonts for each theme live in css/themes.css as [data-theme="..."]
// overrides of the base tokens in css/variables.css. This module just
// toggles the attribute on <html> and remembers which theme is active.
export const THEMES = ['mocha', 'nord', 'gruvbox'];
export const DEFAULT_THEME = 'mocha';

export function applyTheme(themeId){
  var id = THEMES.indexOf(themeId) !== -1 ? themeId : DEFAULT_THEME;
  document.documentElement.setAttribute('data-theme', id);
  return id;
}
