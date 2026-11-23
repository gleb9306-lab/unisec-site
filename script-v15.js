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
const easterDialog = document.querySelector('#easter-dialog');
const easterAudio = easterDialog.querySelector('audio');
const easterVolume = easterDialog.querySelector('.easter-volume input');
const easterPlay = easterDialog.querySelector('.easter-play');
let easterReturnFocus = null;
let easterContext = null;
let easterGain = null;
const setEasterVolume = () => {
  const volume = Number(easterVolume.value) / 100;
  if (easterGain) easterGain.gain.value = volume;
  else easterAudio.volume = volume;
};
setEasterVolume();
easterVolume.addEventListener('input', setEasterVolume);
const playEasterAudio = () => {
  easterPlay.hidden = true;
  // Web Audio supports volume controls even on devices where media.volume is fixed.
  if (!easterContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        easterContext = new AudioContextClass();
        const source = easterContext.createMediaElementSource(easterAudio);
        easterGain = easterContext.createGain();
        source.connect(easterGain).connect(easterContext.destination);
        easterAudio.volume = 1;
        setEasterVolume();
      } catch (error) { easterGain = null; setEasterVolume(); }
    }
  }
  if (easterContext?.state === 'suspended') easterContext.resume().catch(() => {});
  const playback = easterAudio.play();
  if (playback) playback.catch(() => { if (easterDialog.open) easterPlay.hidden = false; });
};
easterPlay.addEventListener('click', playEasterAudio);
easterDialog.querySelector('.easter-close').addEventListener('click', () => easterDialog.close());
easterDialog.addEventListener('close', () => {
  easterAudio.pause();
  easterAudio.currentTime = 0;
  easterPlay.hidden = true;
  easterReturnFocus?.focus({preventScroll:true});
});
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
    if (currentForm.elements.name.value === 'zzzzzzzzzz') {
      easterReturnFocus = currentForm.querySelector('[type="submit"]');
      easterDialog.showModal();
      playEasterAudio();
      easterDialog.querySelector('.easter-close').focus();
      return;
    }
    if (!currentForm.reportValidity()) return;
    currentForm.hidden = true;
    modal.querySelector('.success-state').hidden = false;
  });
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
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !easterDialog.open) { closeModal(); closeLightbox(); } });
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
    "assets/images/compare-v18/boots-before.webp",
    "assets/images/compare-v18/boots-after.webp",
    "Замшевые сапоги · до",
    "Замшевые сапоги · после",
    "Замшевые сапоги"
  ],
  [
    "assets/images/compare-v20/coat-cuff-before.webp",
    "assets/images/compare-v20/coat-cuff-after.webp",
    "Кожаное пальто, манжета до обработки",
    "Кожаное пальто, манжета после обработки",
    "Кожаное пальто · манжета"
  ],
  [
    "assets/images/compare-v20/jacket-detail-before.webp",
    "assets/images/compare-v20/jacket-detail-after.webp",
    "Кожаная куртка, деталь до обработки",
    "Кожаная куртка, деталь после обработки",
    "Кожаная куртка · деталь"
  ],
  [
    "assets/images/compare-v20/jacket-texture-before.webp",
    "assets/images/compare-v20/jacket-texture-after.webp",
    "Кожаная куртка, фактура до обработки",
    "Кожаная куртка, фактура после обработки",
    "Кожаная куртка · фактура"
  ],
  [
    "assets/images/compare-v21/blue-cuff-before.webp",
    "assets/images/compare-v21/blue-cuff-after.webp",
    "Синяя куртка, манжета до обработки",
    "Синяя куртка, манжета после обработки",
    "Синяя куртка · манжета"
  ],
  [
    "assets/images/2k/original-stitch-before.webp",
    "assets/images/2k/original-stitch-after.webp",
    "Строчка изделия до обработки",
    "Строчка изделия после обработки",
    "Строчка изделия"
  ],
  [
    "assets/images/2k/shoulder-before.webp",
    "assets/images/2k/shoulder-after.webp",
    "Плечо изделия до обработки",
    "Плечо изделия после обработки",
    "Плечо изделия"
  ],
  [
    "assets/images/2k/cuff-before.webp",
    "assets/images/2k/cuff-after.webp",
    "Манжета до обработки",
    "Манжета после обработки",
    "Манжета"
  ],
  [
    "assets/images/2k/leather-macro-before.webp",
    "assets/images/2k/leather-macro-after.webp",
    "Кожа крупным планом до обработки",
    "Кожа крупным планом после обработки",
    "Кожа · крупный план"
  ],
  [
    "assets/images/2k/olive-front-before.webp",
    "assets/images/2k/olive-front-after.webp",
    "Куртка спереди до обработки",
    "Куртка спереди после обработки",
    "Куртка · вид спереди"
  ],
  [
    "assets/images/2k/olive-shoulder-before.webp",
    "assets/images/2k/olive-shoulder-after.webp",
    "Плечо куртки до обработки",
    "Плечо куртки после обработки",
    "Плечо куртки"
  ]
].slice(0, 6);
document.querySelector('.comparison-count').textContent = '01 / ' + String(comparePairs.length).padStart(2, '0');
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
document.querySelector('.slider-prev')?.addEventListener('click', () => { pairIndex=(pairIndex+comparePairs.length-1)%comparePairs.length; updatePair(); });
document.querySelector('.slider-next')?.addEventListener('click', () => { pairIndex=(pairIndex+1)%comparePairs.length; updatePair(); });
const initialComparisonObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){initialComparisonObserver.disconnect();updatePair(false);}},{rootMargin:'600px'});
initialComparisonObserver.observe(comparison);

const reviews = [
  [
    "«Отдал вещи в химчистку — забрал, как будто только что купил. Даже не ожидал, что из этого вообще можно было сделать такую красоту. Всё чистенько, свеженько, без лишних запахов и пятен. Теперь главное самому случайно не испачкать.\nРебята знают своё дело, сделали быстро и качественно. Однозначно рекомендую.»",
    "Глеб Воронков",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Химчистка понравилась. Сдавала дубленку двухстороннюю перед осенним сезоном. Очистили все супер и быстро кстати! ( одна сторона кожаная, другая шерстяная). Мама чистила шубу ранее, тоже все было классно. Сотрудники вежливые и подробно все объяснили)) буду ходить постоянно)) »",
    "Дарья",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Отличная химчистка. Сделали всё в срок (обещали за 3 дня, сделали за 2). Вернули вещь в идеальном состоянии: вывели старое пятно от вина с шелка, при этом цвет не пострадал. Цена адекватная за такой уровень. Рекомендую!»",
    "Егор",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Обратился в химчистку с сильно загрязнённой рубашкой,  думал, что вещь уже не спасти. Но специалисты справились! Ткань чистая, никаких разводов или повреждений. Вещь вернули точно в срок. Сдавал также вещи из шерсти, все почистили и дали вещам второе дыхание ) »",
    "Elvin",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Качество химчистки на высоте для любых изделий. Химчистка оснащена современным испанским оборудованием .Режимы обработки изделий соблюдаются. Работаем на договоре и тщательно принимаем изделия. Пальто и натуральные шубы после химчистки  без усадки , изделиям из кожи возвращают новый вид, восстанавливают цвет, устраняют потертости. Белые вещи , пуховики , куртки - идеально чистые даже по рукавам внутри , воротникам .По поводу пятен - насколько давнее пятно , от этого зависит результат. Пуховики воздушные т.к. химчистка имеет  аэроманекен. В случае замечаний возвращают на перечистку без проблем. Работают без выходных с 10 до 22. Настоящие профессионалы своего дела ! »",
    "Наталья",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Огромное спасибо мастерам химчистки за спасение моего пуховика! Я уже думал, что он безнадежно испорчен после зимы (пятна на рукавах и воротнике), но его привели в идеальное состояние. Пух после чистки не сбился, распределен равномерно, нет ни одного развода.»",
    "Александр С.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Спасибо большое мастерам химчистки за качественную работу!!! Пользовалась услугами первый раз. Почистила свадебное платье невесты, костюм и рубашку жениха . Всё безупречно чисто, пятен от загрязнений нет. Весь подол платья был испачкан , так как пошел дождь и намочил асфальт и подолом собрали всю пыль и грязь(((. Сейчас на платье ни пятнышка. Советую пользоваться услуга мастеров этой химчистки!!! Для себя я уже выбор сделала, эта химчистка для меня Премиум!!!»",
    "Людмила Орлова",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Действительно хорошая химчистка, стирал пуховик перед сезоном. Цена отличная, постирали супер и оперативно. Остался очень доволен »",
    "Никита Б.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Химчистка бомба честно говоря, за свою стоимость буквально лучший результат, пользуюсь часто и есть с чем сравнить! Теперь постоянно вещи только сюда и таскаем 😁»",
    "Максим",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Обновили вещи к зимнему сезону, предупредили, где могут возникнуть проблемы. По итогу все хорошо, проблем не возникло. Приветливый персонал. »",
    "Татьяна С.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Самое лучшая химчистка! Оставил Ковры в надежде на очистку, и вправду очистили! быстро классно и аккуратно, обязательно приду сюда снова 🫶🫶🫶»",
    "Никон Травкин",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«очень хорошая химчистка, стирала пальто перед сезоном. цена отличная, постирали супер и быстро!!»",
    "Полина Каптилова",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Все понравилось, подготовил осенний гардероб к сезону. Чистили шерстяные вещи(куртки и жилеты). Все идеально, еще вернусь. »",
    "Лев",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Всем известно, что встречают по одежке, а провожают по уму. И если вторая часть пословицы зависит от каждого из нас, то безупречную чистоту и опрятный вид смело можно доверить сотрудникам и технологиям данной химчистки. Вещи получают вторую жизнь. Безупречное качество и деликатный подход к каждому пятнышку. Я в восторге и всем рекомендую❤️»",
    "Орлова Л.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Очень нравится данная химчистка, постоянный посетитель я. Пальто, пиджаки, джемпера ношу, работают качественно, нравится что предупреждают о возможных нюансах, например на пиджаке у меня могли облезть пуговицы, о чем сотрудник сразу предупредил и предложил срезать их. Всегда приятный,приветливый и вежливый персонал.»",
    "Алена Горелова",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Молодцы, держат качество на должном уровне. Сроки соблюдаются, информационные сообщения о выполнении работ и готовности заказа к выдаче приходят своевременно.»",
    "Алексей Аверьянов",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Отличный сервис, периодически посещаю химчистку. Дают ценные советы по уходу, и выполняют свои обязательства в срок и с высоким качеством. Рекомендую»",
    "advoket2001",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Рекомендую. Хорошо чистят, всегда позвонят, если вещь проблематичная и может дать окрас. Сдавала дорогой пуховик с кожаными петлями, которые при тестировании дали окрас. Позвонили, предложили  услуги рядом расположенного ателье, чтобы вышить петли и снова вшить уже после чистки. Я дала добро и всё сделали без меня как надо. После чистки начисляются бонусы, можно потратить при следующей чистке. Спасибо!»",
    "Юлия Шнякина",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Очень вежливый персонал, привели форму в порядок, выглядит как новая»",
    "Егор Фадеев",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Отдавал зимнюю парку которой 3 года , была засаленная. При приемке предупредили что 10 дней чистка , и указали какие места могут забелить. Цена демократичная,рекомендую»",
    "afonych",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«1900 за хим . чистку пуховика - огонь 👍🏻🔥быстро, качественно. А соседний магазин- ателье, можете сразу сдать отреставрировать/зашить что -то, и они потом передадут в химчистку👍🏻»",
    "София Игнатова",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Отдавала пуловер и куртку. Отлично почистили! Спасибо »",
    "Марина Р.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Оставляли шубу на чистку, все сделали в срок, все отлично!»",
    "Redux",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Замечательная химчистка, недорогая, уже несколько лет сдаю как и верхнюю одежду так и костюмы/рубашки/платья. Все отлично 👍 »",
    "Антонина Лебедева",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Пользовалась пару раз всего: подушку чистила и пуховик.  Все отлично и без претензий. Цены как везде. Удобно,что в тц находится.»",
    "ELENA GRISHKOVA",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Хорошая химчистка , не раз сдавала верхнюю одежду. А из супер испачканного собакой наматрасника , сделали как новый .»",
    "Мария Лазарева",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«пока обратился 1 раз. Чистка мембранной курки зимней. Почистили быстро и не дорого. Доволен.»",
    "ДВ",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Отличная химчистка с бонусной программой. Хотелось бы больше баллов в программе лояльности»",
    "Папа против",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Очень хорошая химчистка, работают профессионалы, отлично почистили пуховик 👍🏻»",
    "Александра К.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Классная химчистка,уже много лет пользуемся их услугами. Все супер »",
    "Anastasia B.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Сдавали костюмы, всё нормально»",
    "Маргарита Ш",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Отличная химчистка по доступным ценам»",
    "данил тихонов",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Адекватные цены и хорошее обслуживание»",
    "Мия Кролликсен",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Хороший сервис. Приятные цены»",
    "Роман Р",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Чистят гладят хорошо.»",
    "Семёныч",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Вежливый внимательный персонал. Стараются удалить все загрязнения. Объясняют в чем проблема, если пятно не отходит. Регулярно сдаю военную форму в химчистку. Всегда идеально отутюжена. Большое спасибо!»",
    "гриша коряченцов",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Вообще очень тяжело для меня все эти вещи с глажкой, чистотой и одеждой, поэтому регулярно сюда сдаю чтобы все сделали нормально, где то пятна от еды на белых вещах остается - сдаю сюда, проходит пару дней, забираю - как будто ничего и не было»",
    "Андрей Т.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Персонал вежливый и внимательный. Все загрязнения стараются удалить. Если пятно не отходит, объясняют, в чём причина. Регулярно сдаю костюмы в химчистку - всегда идеально отутюжены. Большое спасибо!»",
    "Даниил Кравцов",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Отличная хим чистка, вежливый персонал \nОтнёс две куртки, остался очень доволен \nОбязательно обращусь ещё раз ! »",
    "Никита Моногов",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Очень хорошо подготавливают форму, персонал хороший, работают быстро. Все понравилось.»",
    "Ярослав П.",
    5,
    "Москва, Чечёрский проезд, 51"
  ],
  [
    "«Отличная химчистка. Сдавала костюм и несколько своих блузок перед важным мероприятием. Сделали все быстро, уложились в срок, даже отдали на день раньше. Качество отличное: швы целые, пуговицы на месте, ткань не потеряла цвет. Порадовало соотношение цены и качества. Персонал работает четко, без навязывания лишних услуг. Как женщина, которая ценит свои вещи и время, рекомендую!»",
    "Виктория Маслова",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Огромная благодарность за прекрасное обслуживание и ответственный персонал, все прекрасно почистили!»",
    "нина с",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличная хим чистка, отстирали куртку и теперь она как новая, также очень хороший персонал \nОбъяснили как и чем проводилась чистка \nОбращусь снова ! »",
    "Никита Моногов",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Там работают просто волшебницы! Я вляпалась в краску и привезла пальто только через день. Но они не только смогли её убрать, но и пальто словно новое. Я хочу выразить огромную благодарность! Феи не только мастера своего дела, но и очень приятные люди. С меня не взяли оплату сразу, тк не могли дать гарантии, но взялись попробовать и результат выше всяких похвал! Фото до нет, я не думала что пальто можно спасти, но им удалось. Спасибо большое»",
    "марина кравченко",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Хорошая химчистка, высокое качество и бережное отношение к вещам. Обслуживаюсь здесь достаточно долго. \nПерсонал вежливый. »",
    "Anatoly Kuzmin",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Спасибо большое, девочки! Все почистили безупречно. Отдельная благодарность мастеру по ремонту.🙏🌹»",
    "Марина Жданова",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличная химчистка! Все вещи всегда чистим тут.Вежливый персонал,быстро и профессионально!!! »",
    "Алёна Макарова",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличная химчистка , постоянно пользуемся услугами !!! Достойное качество , разумные сроки !!!»",
    "Виктория",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Хорошо и быстро чистят, отдавал пуховики, ковры - всем доволен\nперсонал приветливый»",
    "Игорь Ч",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличная химчистка. Быстро, качественно»",
    "Светлана",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличная химчистка, отдала зимний пуховик, при получении не узнала, в хорошем смысле слова, отчистили даже те пятна которые думала не поддадутся обработке. Очень быстро и качественно, буду приходить ещё) »",
    "Марина2808",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Если возникает потребность в химчистке, то я только тут. Мне нравиться и как чистят и обстановка и парковка   👏»",
    "Maximus",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Приезжали много раз сдавали вещи в прачечную.Без очередей.Всё происходило быстро и без всяких проблем.Общительные и приветливые женщины на приёмке и выдачи!»",
    "ГОША",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Спасибо большое! Думала выкидывать курточку придётся, сама, как только не пыталась почистить, но после чистки в Unisec выглядит, как новая.  Спасибо Вам  большое за ваш труд!»",
    "Евгения Скрипина",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Пока так!!! Из всех обзвоненных в округе химчисток здесь срок выдачи озвучили 2 дня с момента сдачи. Правда на 150 р дороже (по факту). Посмотрим на результат. Позже допишу. Обратился ввиду самой быстрой выдачи с момента сдачи!!!»",
    "Алексей",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Спасибо работникам химчистки  за работу, за понимание и терпение.  Отдельное спасибо главному технологу Наталье Евгеньевне. С уважением, Назарова М. А.»",
    "Марина Н.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отдавали пуховик и пальто в эту химчистку первый раз.\nКачество и цены приятно порадовали.\nБудем пользоваться их услугами, конечно.\n»",
    "Елена Балчугова",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Сдала белый дорогущий пуховик от безысходности. Или выкидывать или рисковать на чистку. Они предупредили, что пятна могут полностью не уйти ( пользуюсь натуральными маслами и воротник с рукавами в разводах с желтизной, да еще юбка окрасилась).   О , чудо. Мне вернули почти идеально чистый пуховик, прям приглядываться на свету надо, чтобы найти на ек на пятнышко. СПАСИБО , кто учавствует в чистке нашей одежды!»",
    "Татьяна",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Обращался через ателье в Электрогорске ,джинсы с пятном от моторного масла, мою проблему решили ,был очень приятно удивлён ,Спасибо Вам !!!»",
    "Инкогнито 1944",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Хорошая химчистка, ковёр нормально почистили.»",
    "Юрий Б.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Чистили зимнюю одежду ( комбинизон,  пуховик), также пиджаки,  все очистили качественно и в срок.»",
    "Владимир Финк",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Хорошо работает. Качественно оказывают услуги. Информирование об акциях никакое. СМС-рассылки нет с 2018 года.  Хотя работники утверждают, что такую информацию рассылают»",
    "ВАРТА",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Спасибо, всё было быстро и качественно»",
    "Сергей Лобанов",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Хорошая, недорогая химчистка. Вежливый персонал. Всё объяснят и расскажут.»",
    "Валентина В.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Прекрасно все и качество работ и обслуживание »",
    "сергей ш.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Привозил меховые накидки на сиденья из зайцев сначала побоялись брать. Но пошли на встречу взяли в итоге всё идеально. Огромное спасибо»",
    "Армен Акопян",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Постоянно пользуюсь услугами этой химчистки. Вежливый персонал, отличное качество работы»",
    "Ольга Игориевна",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Чехол от дивана отмыли идеально,даже не узнал его,предупредили о повреждениях и что может разойтись,но все было хорошо,позвонили,забрал все идеально.Мне очень понравилось!»",
    "Даниил Тумановский",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Быстро и качественно.»",
    "Олег Круглов",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличная работа персонала! Быстрая и качественная работа!  Советую!»",
    "Елена Ларионова",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Быстро выполнили заказ, забрал костюм через 4 часа. Молодцы!»",
    "Оазис  Групп Строительство",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Спасибо огромное ! Сдавала вам пуховик , канада гус -белый , отлично почистили . Теперь только к вам .»",
    "Елена М.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Химчистка 👍, всегда смс сообщают о скидках и акциях, чистят почти все»",
    "olga.borodovskaya15",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Хорошо работают. Успехов и процветания.  Молодцы. Чистили пуховые подушки. »",
    "Геннадий",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличная химчистка, обратился не в первый раз, все отлично!»",
    "Иван",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличный персонал , оперативно выполняют заказ.»",
    "Алексей Ильин",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Приезжаю из соседнего города из-за качества и демократических цен.»",
    "Анастасия",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«качественно,быстро,сдавал постельное белье »",
    "александр волков",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Классная химчистка и делают мелкий ремонт одежды.»",
    "Михаил П.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Очень хорошо почистили гардины на подкладке, качественно, вывели пятна без потери в цвете»",
    "Ирина",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Замечательно, всё чисто и в срок.»",
    "Александр Князев",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Хорошо почищены вещи и постельное белье.»",
    "Наталья Анкудинова",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Чистят хорошо. Цены демократичные. Сдача-приёмка понятна.»",
    "игорь пилюгин",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Почистили  замшу так, что отошли все пятна , которым 25 лет!»",
    "Sasha Mendeleeva",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличное оборудование, грамотный персонал.»",
    "Service U.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Всё хорошо»",
    "Михаил Костомаров",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличное место , рекомендую»",
    "Вячеслав",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Чистят хорошо, быстро, но дорого.»",
    "Пользователь Яндекс Карт",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Быстро!!! \nКачественно!!! \nЧисто!!! \nИ в срок!!!»",
    "Пчеловод.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Район истомкино.хорогая химчистка.»",
    ".",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Быстро. Качественно.»",
    "Владимир Б.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Всё супер! Цены как везде.»",
    "Иван",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Отличная химчиска»",
    "Пользователь Яндекс Карт",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Без претензий, но деньги вперед.....»",
    "Максим",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Все замечательно, но дороговато.»",
    "Пользователь Яндекс Карт",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Приветливый персонал.»",
    "Елена Исакова",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«хорошая химчистка»",
    "Марина",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«класс»",
    "С.Г.В.",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Хорошая Химчистка. »",
    "Илья Гладков",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ],
  [
    "«Качество и сервис, лучшая х/чистка в Ногинске!»",
    "DIGITAL CARD",
    5,
    "Ногинск, 2-й Истомкинский проезд, 2А"
  ]
].filter(review => review[3] === "Москва, Чечёрский проезд, 51");
let reviewIndex = 0;
const renderReview = () => {
  const [quote, name, rating, address] = reviews[reviewIndex];
  document.querySelector('#review-text').textContent = quote;
  document.querySelector('#review-name').textContent = name;
  document.querySelector('#review-type').textContent = 'Яндекс Карты · ' + address;
  document.querySelector('.avatar').textContent = name.slice(0, 2).toUpperCase();
  const stars = document.querySelector('.review-meta .stars');
  if (stars) { stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating); stars.setAttribute('aria-label', `Оценка: ${rating} из 5`); }
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


