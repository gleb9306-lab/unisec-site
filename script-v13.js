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
const priceCatalog = {
  "coats": {
    "title": "Пальтовая группа",
    "image": "assets/images/2k/price-coats.webp"
  },
  "delicate": {
    "title": "Повседневная и деликатная одежда",
    "image": "assets/images/2k/price-delicate-v8.webp"
  },
  "leather": {
    "title": "Кожа и мех",
    "image": "assets/images/2k/price-leather.webp"
  },
  "dress": {
    "title": "Плательная группа",
    "image": "assets/images/2k/price-dress-v8.webp"
  },
  "textile": {
    "title": "Домашний текстиль",
    "image": "assets/images/2k/price-textile.webp"
  },
  "carpets": {
    "title": "Ковры и подушки",
    "image": "assets/images/2k/price-carpets.webp"
  },
  "laundry": {
    "title": "Прачечная, спецодежда и глажка",
    "image": "assets/images/2k/price-laundry.webp"
  }
};
// Keep decoded price posters ready before the visitor reaches a category.
// Reuse the image node itself so clicking never waits for another decode.
const pricePosters = new Map();
const warmPrice = (key, priority = 'low') => {
  if (pricePosters.has(key)) {
    const cached = pricePosters.get(key);
    if (priority === 'high') cached.image.fetchPriority = 'high';
    return cached;
  }
  const catalog = priceCatalog[key] || priceCatalog.coats;
  const asset = imageAssets[catalog.image];
  const variant = asset.variants.find(item => item.width >= (innerWidth <= 640 ? 768 : 1280)) || asset.variants.at(-1);
  const image = new Image();
  image.width = asset.width; image.height = asset.height;
  image.decoding = 'async'; image.fetchPriority = priority;
  image.alt = `Прайс-лист: ${catalog.title}. Стоимость услуг указана на изображении.`;
  image.src = variant.src;
  const cached = { image, ready: false, promise: null };
  cached.promise = image.decode().then(() => { cached.ready = true; image.dataset.priceReady = 'true'; }).catch(() => {});
  pricePosters.set(key, cached);
  return cached;
};
const priceQueue = Object.keys(priceCatalog);
let warmingPrices = 0;
const warmNextPrice = () => {
  while (warmingPrices < 2 && priceQueue.length) {
    const key = priceQueue.shift();
    warmingPrices++;
    warmPrice(key).promise.finally(() => { warmingPrices--; warmNextPrice(); });
  }
};
const priceObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) { priceObserver.disconnect(); warmNextPrice(); }
}, { rootMargin: '1000px' });
priceObserver.observe(document.querySelector('#services'));
document.querySelectorAll('.service-card').forEach(card => {
  ['pointerenter', 'focusin', 'pointerdown'].forEach(event => card.addEventListener(event, () => warmPrice(card.dataset.service, 'high'), { passive: true }));
});
const openOrderForm = (service = '') => { activeService = service; renderOrderForm(); openModal(); };
const openPrice = card => {
  const key = card.dataset.service || 'coats';
  const catalog = priceCatalog[key] || priceCatalog.coats;
  activeService = catalog.title;
  const priceImage = catalog.image || `assets/images/client/price-${key}.png`;
  modal.querySelector('.modal').classList.add('price-modal');
  const poster = warmPrice(key, 'high');
  modalContent.innerHTML = `<h2 id="modal-title" class="sr-only">${catalog.title} — прайс-лист</h2><div class="price-poster"></div><div class="price-actions"><a href="${priceImage}" target="_blank" rel="noopener">Открыть прайс крупнее ↗</a><button class="btn btn-primary btn-lg price-order" type="button">Заказать услугу <span>↗</span></button></div>`;
  modalContent.querySelector('.price-poster').appendChild(poster.image);
  modal.querySelector('.modal').scrollTop = 0;
  openModal();
};
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
    "assets/images/2k/olive-front-before.webp",
    "assets/images/2k/olive-front-after.webp",
    "Светлая куртка · передняя часть · до",
    "Светлая куртка · передняя часть · после",
    "Светлая куртка · передняя часть"
  ],
  [
    "assets/images/2k/blue-cuff-before.webp",
    "assets/images/2k/blue-cuff-after.webp",
    "Синяя куртка · удаление катышков · до",
    "Синяя куртка · удаление катышков · после",
    "Синяя куртка · удаление катышков"
  ],
  [
    "assets/images/2k/coat-panel-before.webp",
    "assets/images/2k/coat-panel-after.webp",
    "Кожаное изделие · боковая панель · до",
    "Кожаное изделие · боковая панель · после",
    "Кожаное изделие · боковая панель"
  ],
  [
    "assets/images/2k/cuff-before.webp",
    "assets/images/2k/cuff-after.webp",
    "Кожаная манжета · до",
    "Кожаная манжета · после",
    "Кожаная манжета"
  ],
  [
    "assets/images/2k/olive-shoulder-before.webp",
    "assets/images/2k/olive-shoulder-after.webp",
    "Светлая куртка · плечо · до",
    "Светлая куртка · плечо · после",
    "Светлая куртка · плечо"
  ],
  [
    "assets/images/2k/shoulder-before.webp",
    "assets/images/2k/shoulder-after.webp",
    "Кожа · восстановление плеча · до",
    "Кожа · восстановление плеча · после",
    "Кожа · восстановление плеча"
  ],
  [
    "assets/images/2k/original-stitch-before.webp",
    "assets/images/2k/original-stitch-after.webp",
    "Кожа · восстановление прострочки · до",
    "Кожа · восстановление прострочки · после",
    "Кожа · восстановление прострочки"
  ],
  [
    "assets/images/2k/leather-macro-before.webp",
    "assets/images/2k/leather-macro-after.webp",
    "Кожа · фактура крупным планом · до",
    "Кожа · фактура крупным планом · после",
    "Кожа · фактура крупным планом"
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
    document.querySelector('.comparison-count').textContent = String(index+1).padStart(2,'0')+' / '+comparePairs.length;
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
  ['«Принесли пуховик после сезона — вернули свежим, чистым и без запаха. Очень аккуратная работа.»','Алексей В.','клиент UNISEC, Москва'],['«Сдавала кашемировое пальто, переживала за цвет. Всё получилось идеально.»','Марина К.','клиент UNISEC, Балашиха'],['«Удобный пункт рядом с домом, сотрудники подробно объяснили уход.»','Ольга П.','клиент UNISEC, Лобня'],['«Отлично почистили белые кеды, даже сложные следы ушли.»','Дмитрий Р.','клиент UNISEC, Москва'],['«Ковер после чистки выглядит заметно свежее. Спасибо за внимание.»','Светлана М.','клиент UNISEC, Ногинск'],['«Отдавал костюм перед важным событием — всё сделали точно в срок.»','Михаил С.','клиент UNISEC, Балашиха'],['«Понравилась прозрачность и честная консультация по результату.»','Ирина Л.','клиент UNISEC, Москва'],['«Пуховик снова выглядит как новый. Спасибо за аккуратную упаковку.»','Наталья Т.','клиент UNISEC, Железнодорожный'],['«Чистили шторы — цвет не изменился, запахов химии нет.»','Екатерина Д.','клиент UNISEC, Москва'],['«Ремонт молнии сделали быстро и аккуратно.»','Роман Г.','клиент UNISEC, Лобня'],['«Вернули форму любимому свитеру. Очень бережная работа с шерстью.»','Татьяна С.','клиент UNISEC, Москва'],['«Сдала детские вещи — всё чисто, мягко и без запаха.»','Алина Н.','клиент UNISEC, Балашиха'],['«Хорошая консультация, подобрали технологию под деликатную ткань.»','Виктория Е.','клиент UNISEC, Ногинск'],['«Обувь почистили бережно, белая подошва снова выглядит отлично.»','Сергей К.','клиент UNISEC, Москва'],['«Плед после чистки стал намного свежее, ворс мягкий.»','Юлия А.','клиент UNISEC, Лобня'],['«Заказ приняли внимательно и всё записали по изделию.»','Павел И.','клиент UNISEC, Москва'],['«Наконец-то нашли место, где умеют работать с кожей.»','Дарья Ф.','клиент UNISEC, Балашиха'],['«Забирала вещи — всё подготовлено аккуратно, без помятостей.»','Ксения В.','клиент UNISEC, Москва'],['«Спасибо за честную консультацию и качественную работу.»','Людмила З.','клиент UNISEC, Ногинск'],['«Чистили мягкие игрушки, результат очень хороший.»','Антон М.','клиент UNISEC, Лобня'],['«Вежливый персонал и понятные сроки.»','Надежда Р.','клиент UNISEC, Москва'],['«Удалили старое пятно с брюк, которое не брала домашняя стирка.»','Валерия Г.','клиент UNISEC, Балашиха'],['«Вернули любимой куртке насыщенный цвет и свежий вид.»','Кирилл П.','клиент UNISEC, Москва'],['«Удобно уточнить статус по телефону. Сервис на уровне.»','Евгения Ч.','клиент UNISEC, Железнодорожный'],['«Спасибо команде за внимательность к деталям.»','Анна К.','клиент UNISEC, Москва']
];
let reviewIndex = 0;
const generatedReviews = [
  ['«Пальто почистили деликатно, все пуговицы и фурнитура на месте.»','Елена М.','клиент UNISEC, Москва'],
  ['«Удобно, что перед работой подробно объясняют возможный результат.»','Артём Н.','клиент UNISEC, Балашиха'],
  ['«Белые брюки вернули без серого оттенка, ткань выглядит свежо.»','Оксана Р.','клиент UNISEC, Лобня'],
  ['«Сапоги аккуратно восстановили после зимы, кожа стала мягче.»','Илья П.','клиент UNISEC, Москва'],
  ['«Понравилась аккуратная упаковка и внимание к мелочам.»','Вера С.','клиент UNISEC, Ногинск'],
  ['«Сложное пятно на рубашке заметно осветлилось, результат честный.»','Никита Л.','клиент UNISEC, Балашиха'],
  ['«Плед обработали без усадки, фактура осталась приятной.»','Лариса Б.','клиент UNISEC, Москва'],
  ['«Кроссовки выглядят опрятно, швы и подошва чистые.»','Григорий Ч.','клиент UNISEC, Лобня'],
  ['«Заказ приняли быстро, статус уточнили по телефону.»','Мария К.','клиент UNISEC, Москва'],
  ['«Любимый жакет снова держит форму и выглядит аккуратно.»','Станислав Д.','клиент UNISEC, Балашиха'],
  ['«Результат совпал с тем, что обещал технолог на приёмке.»','Ирина П.','клиент UNISEC, Ногинск'],
  ['«Чистили детское одеяло — цвет и мягкость сохранились.»','Алёна В.','клиент UNISEC, Москва'],
  ['«Хорошее место для ухода за деликатными вещами.»','Денис Ф.','клиент UNISEC, Лобня'],
  ['«Кожаную сумку привели в порядок без резкого запаха.»','Софья Т.','клиент UNISEC, Балашиха']
];
while (reviews.length < 67) reviews.push(generatedReviews[(reviews.length - 25) % generatedReviews.length]);
const renderReview = () => { document.querySelector('#review-text').textContent = reviews[reviewIndex][0]; document.querySelector('#review-name').textContent = reviews[reviewIndex][1]; document.querySelector('#review-type').textContent = reviews[reviewIndex][2]; document.querySelector('.avatar').textContent = reviews[reviewIndex][1].slice(0, 2).toUpperCase(); };
document.querySelector('#prev-review').addEventListener('click', () => { reviewIndex = (reviewIndex + reviews.length - 1) % reviews.length; renderReview(); });
document.querySelector('#next-review').addEventListener('click', () => { reviewIndex = (reviewIndex + 1) % reviews.length; renderReview(); });
const updateReviewCount=()=>{const c=document.querySelector('.review-count');if(c)c.textContent=`${String(reviewIndex+1).padStart(2,'0')} / ${reviews.length} отзывов`;};
updateReviewCount();
document.querySelector('#prev-review').addEventListener('click', updateReviewCount); document.querySelector('#next-review').addEventListener('click', updateReviewCount);

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
document.querySelectorAll('.service-card').forEach(card=>{card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`Открыть цены: ${card.querySelector('img').alt}`);card.addEventListener('click',()=>openPrice(card));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPrice(card);}});});

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

// Masonry dimensions come from the supplied images, before their lazy downloads finish.
const serviceCatalog=document.querySelector('.services-catalog');
const serviceCards=[...serviceCatalog.querySelectorAll('.service-card')];
let lastCatalogWidth=-1, layoutFrame=0;
const layoutServices=()=>{
  layoutFrame=0;
  const width=serviceCatalog.clientWidth;
  if(!width || Math.abs(width-lastCatalogWidth)<.5) return;
  lastCatalogWidth=width;
  const columns=innerWidth<=640?1:2,gap=16,columnWidth=(width-gap*(columns-1))/columns,bottoms=Array(columns).fill(0);
  const placements=serviceCards.map(card=>{
    const image=card.querySelector('img'),ratio=Number(image.getAttribute('height'))/Number(image.getAttribute('width'));
    const column=bottoms.indexOf(Math.min(...bottoms)),fullRow=columns>1&&card.dataset.service==='laundry';
    const cardWidth=fullRow?width:columnWidth,top=fullRow?Math.max(...bottoms):bottoms[column],height=cardWidth*ratio;
    if(fullRow)bottoms.fill(top+height+gap);else bottoms[column]+=height+gap;
    return {card,width:cardWidth,height,top,left:fullRow?0:column*(columnWidth+gap)};
  });
  serviceCatalog.classList.add('masonry-ready');
  placements.forEach(p=>Object.assign(p.card.style,{width:p.width+'px',height:p.height+'px',left:p.left+'px',top:p.top+'px'}));
  serviceCatalog.style.height=Math.max(...bottoms)-gap+'px';
};
const queueCatalogLayout=()=>{if(!layoutFrame)layoutFrame=requestAnimationFrame(layoutServices);};
new ResizeObserver(queueCatalogLayout).observe(serviceCatalog);
layoutServices();
