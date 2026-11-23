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
})();
