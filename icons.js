// Swaps Phosphor <i class="ph ph-NAME"> for the page's own SVG set (window.ICONS from icons-<variant>.js).
// Load with defer after app.js so rendered content is already in the DOM.
document.querySelectorAll('i[class*="ph-"]').forEach((i) => {
  const name = [...i.classList].find((c) => c.startsWith('ph-') && c !== 'ph-fill')?.slice(3);
  const body = window.ICONS?.[name];
  if (!body) return console.warn('icon missing:', name);
  i.outerHTML = `<svg class="icon icon-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
});
