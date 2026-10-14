'use strict';

(() => {
  const storageKey = 'occ-website-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try {
    const saved = localStorage.getItem(storageKey);
    if (['light', 'dark', 'system'].includes(saved)) preference = saved;
  } catch { /* Theme selection also works when browser storage is unavailable. */ }

  function applyTheme() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.content = theme === 'dark' ? '#24282e' : '#ebe9e3';
  }

  applyTheme();
  system.addEventListener('change', () => {
    if (preference === 'system') applyTheme();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('theme-select');
    select.value = preference;
    select.addEventListener('change', () => {
      if (!['light', 'dark', 'system'].includes(select.value)) return;
      preference = select.value;
      try { localStorage.setItem(storageKey, preference); } catch { /* Keep the current tab usable. */ }
      applyTheme();
    });
  });
})();
