/* Images supplied with the project: add illustrations to the two remaining benefit cards. */
(() => {
  const cards = document.querySelectorAll('.benefits-v14 .benefit-v14');
  const extras = [
    {index:4, name:'process-inspection', alt:'Иллюстрация работы специалиста с одеждой'},
    {index:5, name:'process-control', alt:'Иллюстрация финальной подготовки вещи'}
  ];
  extras.forEach(({index,name,alt}) => {
    const card = cards[index];
    if (!card || card.querySelector('.benefit-v14-image')) return;
    const img = document.createElement('img');
    img.className = 'benefit-v14-image';
    img.src = `assets/images/screen-v11/${name}-768.webp`;
    img.srcset = `assets/images/screen-v11/${name}-480.webp 480w, assets/images/screen-v11/${name}-768.webp 768w, assets/images/screen-v11/${name}-1280.webp 1280w`;
    img.sizes = '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw';
    img.loading = 'lazy'; img.decoding = 'async'; img.alt = alt;
    card.prepend(img);
  });
})();

