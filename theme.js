'use strict';
const THEME_STORAGE_KEY = 'rafeeq_theme';
function applyTheme(theme) {
    const body = document.body; if (!body) return;
    if (theme === 'day') body.classList.add('day-mode'); else body.classList.remove('day-mode');
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) {}
}
function getSavedTheme() {
    try { const saved = localStorage.getItem(THEME_STORAGE_KEY); if (saved === 'day' || saved === 'night') return saved; } catch (e) {}
    return 'night';
}
function toggleTheme() { const isDay = document.body.classList.contains('day-mode'); applyTheme(isDay ? 'night' : 'day'); }
window.RafeeqTheme = { apply: applyTheme, toggle: toggleTheme, get: getSavedTheme };
function initializeTheme() { applyTheme(getSavedTheme()); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeTheme); else initializeTheme();
