/* A full-width information strip already separates its neighbours. */
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  main.querySelectorAll(':scope > .section-divider-v15').forEach(divider => {
    if (divider.previousElementSibling?.matches('.trust-bar, .numbers')) divider.remove();
  });
})();
