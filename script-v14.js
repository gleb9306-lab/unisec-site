const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

let headerScrolled=false;
window.addEventListener('scroll', () => {const next=scrollY>24;if(next!==headerScrolled){headerScrolled=next;header.classList.toggle('scrolled',next);}}, {passive:true});
menuToggle?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const modal = document.querySelector('#order-modal');
const modalContent = modal.querySelector('.modal-content');
const defaultModalContent = modalContent.innerHTML;
let activeService = '';
const openModal = () => {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(()=>{if(!modal.classList.contains('open'))return;const target=innerWidth<=640?modal.querySelector('.modal'):modal.querySelector('.price-order,input');target?.focus({preventScroll:true});});
};
const closeModal = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
const bindOrderForm = () => {
  const currentForm = modal.querySelector('#order-form');
  if (!currentForm) return;
  const serviceSelect = currentForm.querySelector('[name="service"]');
  if (activeService && serviceSelect) {
    const serviceLabel = activeService || 'Пальтовая группа';
    const selected = [...serviceSelect.options].find(option => option.textContent === serviceLabel);
    if (selected) serviceSelect.value = selected.value;
  }
  currentForm.addEventListener('submit', event => {
    event.preventDefault();
    currentForm.hidden = true;
    modal.querySelector('.success-state').hidden = false;
  }, { once: true });
};
const renderOrderForm = () => {
  modal.querySelector('.modal').classList.remove('price-modal');
  modalContent.innerHTML = defaultModalContent;
  bindOrderForm();
};
const openOrderForm = (service = '') => { activeService = service; renderOrderForm(); openModal(); };
document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', () => {
  mobileNav?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  openOrderForm();
}));
modal.addEventListener('click', event => {
  if (event.target === modal || event.target.closest('.modal-close,[data-close-modal]')) { closeModal(); return; }
  if (event.target.closest('.price-order')) { openOrderForm(activeService); }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeModal(); closeLightbox(); } });
bindOrderForm();

document.querySelectorAll('.faq-item').forEach(item => item.addEventListener('click', () => {
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(openItem => openItem.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}));

const processImg = document.querySelector('#process-img');
const processCaption = document.querySelector('#process-caption');
const sizeProcessFrame = src => {
  const asset = imageAssets[src];
  if (!asset) return;
  processImg.closest('.process-image').style.setProperty('--process-ratio', asset.width / asset.height);
  processImg.width = asset.width; processImg.height = asset.height;
};
sizeProcessFrame(document.querySelector('.process-step.active').dataset.img);
let processSwitch = 0;
document.querySelectorAll('.process-step').forEach(step => step.addEventListener('click', async () => {
  const version = ++processSwitch;
  document.querySelectorAll('.process-step').forEach(item => item.classList.toggle('active', item === step));
  const preload = prepareImage(new Image(), step.dataset.img);
  await preload.decode().catch(()=>{});
  if(version !== processSwitch) return;
  sizeProcessFrame(step.dataset.img);
  prepareImage(processImg,step.dataset.img);
  processImg.alt = step.dataset.caption;
  if(processCaption) processCaption.textContent = step.dataset.caption;
  processImg.dispatchEvent(new Event('processchange'));
}));

const comparison = document.querySelector('.before-after');
const clip = document.querySelector('.before-clip');
const range = comparison.querySelector('input');
range.min = '0';
range.max = '100';
const setComparisonSplit = value => {
  const numericValue = Math.max(0, Math.min(100, Number(value)));
  // Keep one source of truth for both the divider and the reveal edge.  Using
  // the same CSS variable for both avoids the compositor having to reconcile
  // two independently changing values while the range input is dragged.
  comparison.style.setProperty('--split', `${numericValue}%`);
  // The CSS rule derives the clip edge from --split. Avoid a second inline
  // clip-path value so the divider and image edge are updated in one frame.
  clip.style.transition = 'none';
};
range.addEventListener('input', () => setComparisonSplit(range.value));
setComparisonSplit(range.value);
const comparePairs = [
  [
    "assets/images/2k/jacket-before-full.webp",
    "assets/images/2k/jacket-after-full.webp",
    "Кожаная куртка · до",
    "Кожаная куртка · после",
    "Кожаная куртка"
  ],
  [
    "assets/images/2k/coat-panel-before.webp",
    "assets/images/2k/coat-panel-after.webp",
    "Кожаное изделие · до",
    "Кожаное изделие · после",
    "Кожаное изделие"
  ],
  [
    "assets/images/compare-v21/blue-cuff-before.webp",
    "assets/images/compare-v21/blue-cuff-after.webp",
    "Синяя куртка · до",
    "Синяя куртка · после",
    "Синяя куртка"
  ],
  [
    "assets/images/compare-v18/boots-before.webp",
    "assets/images/compare-v18/boots-after.webp",
    "Обувь · до",
    "Обувь · после",
    "Обувь"
  ],
  [
    "assets/images/compare-v20/jacket-detail-before.webp",
    "assets/images/compare-v20/jacket-detail-after.webp",
    "Деталь куртки · до",
    "Деталь куртки · после",
    "Деталь куртки"
  ],
  [
    "assets/images/compare-v20/jacket-texture-before.webp",
    "assets/images/compare-v20/jacket-texture-after.webp",
    "Фактура ткани · до",
    "Фактура ткани · после",
    "Фактура ткани"
  ],
  [
    "assets/images/2k/olive-front-before.webp",
    "assets/images/2k/olive-front-after.webp",
    "Куртка · до",
    "Куртка · после",
    "Куртка"
  ],
  [
    "assets/images/2k/olive-shoulder-before.webp",
    "assets/images/2k/olive-shoulder-after.webp",
    "Плечо изделия · до",
    "Плечо изделия · после",
    "Плечо изделия"
  ]
];
let pairIndex = 0;
let pairSwitch = 0;
const pairPages = document.querySelector('.comparison-pages');
comparePairs.forEach((pair, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = String(index + 1).padStart(2,'0');
  button.classList.toggle('active',index===0);button.setAttribute('aria-pressed',String(index===0));
  button.setAttribute('aria-label', 'Пример ' + (index + 1) + ': ' + pair[4]);
  button.addEventListener('click', () => { pairIndex = index; updatePair(); });
  pairPages.appendChild(button);
});
const updatePair = (animate = true) => {
  const p = comparePairs[pairIndex];
  const index = pairIndex;
  const version = ++pairSwitch;
  const after = comparison.querySelector('.after-img');
  const before = comparison.querySelector('.before-clip img');
  const apply = () => {
    if(version !== pairSwitch) return;
    prepareImage(after,p[1]); after.alt = p[3];
    prepareImage(before,p[0]); before.alt = p[2];
    document.querySelector('.comparison-title').textContent = p[4];
    document.querySelector('.comparison-count').textContent = String(index+1).padStart(2,'0')+' / '+String(comparePairs.length).padStart(2,'0');
    pairPages.querySelectorAll('button').forEach((button, i) => {
      button.classList.toggle('active',i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    comparison.classList.remove('is-changing');
  };
  if(animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) comparison.classList.add('is-changing');
  const images = p.slice(0,2).map(src => { return prepareImage(new Image(),src); });
  Promise.all(images.map(image => image.decode().catch(()=>{}))).then(() => {
    if(version !== pairSwitch) return;
    const ratio = Math.max(...images.map(image => image.naturalWidth / image.naturalHeight).filter(Number.isFinite));
    if(ratio > 0) comparison.style.setProperty('--photo-ratio', ratio);
    apply();
  });
};
comparison.querySelector('.slider-prev')?.addEventListener('click', () => { pairIndex=(pairIndex+comparePairs.length-1)%comparePairs.length; updatePair(); });
comparison.querySelector('.slider-next')?.addEventListener('click', () => { pairIndex=(pairIndex+1)%comparePairs.length; updatePair(); });
const initialComparisonObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){initialComparisonObserver.disconnect();updatePair(false);}},{rootMargin:'600px'});
initialComparisonObserver.observe(comparison);

const reviews = [
  [
    "«Химчистка понравилась. Сдавала дубленку двухстороннюю перед осенним сезоном. Очистили все супер и быстро кстати! ( одна сторона кожаная, другая шерстяная). Мама чистила шубу ранее, тоже все было классно. Сотрудники вежливые и подробно все объяснили)) буду ходить постоянно))»",
    "Дарья"
  ],
  [
    "«Отличная химчистка. Сделали всё в срок (обещали за 3 дня, сделали за 2). Вернули вещь в идеальном состоянии: вывели старое пятно от вина с шелка, при этом цвет не пострадал. Цена адекватная за такой уровень. Рекомендую!»",
    "Егор"
  ],
  [
    "«Огромное спасибо мастерам химчистки за спасение моего пуховика! Я уже думал, что он безнадежно испорчен после зимы (пятна на рукавах и воротнике), но его привели в идеальное состояние. Пух после чистки не сбился, распределен равномерно, нет ни одного развода.»",
    "Александр С."
  ],
  [
    "«Обновили вещи к зимнему сезону, предупредили, где могут возникнуть проблемы. По итогу все хорошо, проблем не возникло. Приветливый персонал.»",
    "Татьяна С."
  ]
];
let reviewIndex = 0;
const renderReview = () => {
  const [quote, name] = reviews[reviewIndex];
  document.querySelector('#review-text').textContent = quote;
  document.querySelector('#review-name').textContent = name;
  document.querySelector('#review-type').textContent = 'Яндекс Карты · Чечёрский проезд, 51';
  document.querySelector('.avatar').textContent = name.slice(0, 2).toUpperCase();
  const count = document.querySelector('.review-count');
  if (count) count.textContent = `${String(reviewIndex + 1).padStart(2, '0')} / ${String(reviews.length).padStart(2, '0')}`;
};
document.querySelector('#prev-review').addEventListener('click', () => { reviewIndex = (reviewIndex + reviews.length - 1) % reviews.length; renderReview(); });
document.querySelector('#next-review').addEventListener('click', () => { reviewIndex = (reviewIndex + 1) % reviews.length; renderReview(); });
renderReview();

const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
const closeLightbox = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
const gallery = document.querySelector('.gallery');
const extraGallery = [];
const baseGallery = [...document.querySelectorAll('.gallery-item')];
baseGallery.forEach(item => { if (!item.dataset.category) item.dataset.category = 'одежда'; });
extraGallery.forEach(([category,alt,src])=>{ const item=document.createElement('button'); item.className='gallery-item'; item.dataset.category=category; item.innerHTML=`<img src="${src}" alt="${alt}" loading="lazy" />`; gallery.appendChild(item); });
const galleryItems = [...document.querySelectorAll('.gallery-item')];
gallery?.addEventListener('click', event => {
  const item = event.target.closest('.gallery-item');
  if (!item) return;
  const image = item.querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
});
document.querySelectorAll('.filter-tabs button').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('.filter-tabs button').forEach(x=>x.classList.remove('active'));
  tab.classList.add('active');
  const filter = tab.textContent.trim().toLowerCase();
  galleryItems.forEach((item) => { const category = (item.dataset.category || 'одежда').toLowerCase(); item.hidden = filter !== 'все' && category !== filter; });
}));
// The top anchor belongs to the document rather than the fixed header.
document.querySelectorAll('.brand[href="#top"]').forEach(brand => {
  brand.addEventListener('click', event => {
    event.preventDefault();
    mobileNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    history.replaceState(null, '', location.pathname + location.search + '#top');
  });
});

