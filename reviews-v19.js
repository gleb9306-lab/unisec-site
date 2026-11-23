(() => {
  const section = document.querySelector('#reviews');
  const controls = section?.querySelector('.review-controls');
  const card = section?.querySelector('.review-card');
  const previous = controls?.querySelector('#prev-review');
  const next = controls?.querySelector('#next-review');
  if (!section || !controls || !card || !previous || !next) return;
  const stage = document.createElement('div');
  stage.className = 'reviews-v19-stage';
  previous.classList.add('review-arrow');
  next.classList.add('review-arrow');
  card.before(stage);
  stage.append(previous, card, next);
  controls.remove();

  let touchStartX = 0;
  stage.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    const touchEndX = event.changedTouches[0]?.clientX || 0;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) < 44) return;
    if (deltaX < 0) next.click();
    else previous.click();
  }, { passive: true });
})();
