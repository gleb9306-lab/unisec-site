/* Customer's factory, strengths and process sections. Load before script-v13.js and motion-v13.js. */
(() => {
  const imagePath = name => `assets/images/factory-v14/${name}-1280.webp`;
  const benefitImages = {
    facade: 'assets/images/customer-2026/02-clothes-rack.webp',
    delicate: 'assets/images/customer-2026/02-clothes-rack.webp',
    equipment: 'assets/images/customer-2026/12-industrial-machines.webp',
    steam: 'assets/images/customer-2026/14-garment-treatment.webp',
    chemistry: 'assets/images/customer-2026/16-chemistry-workspace.webp',
    ironing: 'assets/images/customer-2026/15-factory-floor.webp',
    finished: 'assets/images/customer-2026/07-covered-garments-detail.webp'
  };
  const benefitDimensions = {
    facade: [1448, 1086], delicate: [1448, 1086], equipment: [1312, 1199],
    steam: [1536, 1024], chemistry: [1536, 1024], ironing: [1199, 1312],
    finished: [1448, 1086]
  };
  const image = (name, alt, className = '') => {
    const [width, height] = benefitDimensions[name] || [1280, 853];
    return `<img class="${className}" src="${benefitImages[name] || imagePath(name)}" alt="${alt}" loading="lazy" decoding="async" width="${width}" height="${height}">`;
  };
  const about = document.querySelector('#about');
  const why = document.querySelector('.why');
  const process = document.querySelector('#process');
  if (!about || !why || !process) return;

  // The customer-supplied facade image is an illustration; do not label it a documentary photo of the factory.
  about.innerHTML = `<div class="factory-v14-visual"><img src="assets/images/customer-2026/02-clothes-rack.webp" alt="Фасад пункта UNISEC на Чечёрском проезде" loading="lazy" decoding="async" width="1448" height="1086"></div>
    <div class="factory-v14-copy factory-copy"><p class="eyebrow">/ ПОЧЕМУ UNISEC</p><h2>Почему <em>UNISEC</em></h2>
      <h3>Собственная фабрика</h3>
      <p>За каждым чистым изделием стоит целый технологический процесс. На собственной фабрике UNISEC мы подбираем способ обработки, работаем с профессиональным оборудованием, выполняем чистку, глажку и финальную подготовку каждой вещи.</p>
      <p>Для разных типов тканей и изделий применяются свои режимы обработки, что позволяет работать бережно и точно.</p>
      <a class="btn btn-dark" href="#process">Путь вашей вещи <span>↓</span></a>
    </div>`;

  const benefits = [
    ['Собственная фабрика', 'Все основные этапы обработки проходят на собственной фабрике UNISEC. Мы контролируем путь вещи от момента приёмки и подбора технологии до глажки, финальной подготовки и возврата клиенту.', 'delicate', 'Иллюстрация бережного ухода за одеждой'],
    ['Профессиональное оборудование', 'Используем специализированное оборудование для химчистки, стирки, сушки, отпаривания и глажки. Для разных типов тканей и изделий применяются свои режимы обработки, что позволяет работать бережно и точно.', 'equipment', 'Иллюстрация оборудования для ухода за вещами'],
    ['Опыт с 1984 года', 'Более 40 лет мы работаем с одеждой, обувью и домашним текстилем. За это время накоплен большой практический опыт работы с различными материалами, конструкциями изделий и сложными видами загрязнений.', 'steam', 'Специалист обрабатывает одежду UNISEC'],
    ['Профессиональная химия', 'Средства и технология обработки подбираются индивидуально с учётом состава материала, цвета, отделки и характера загрязнения. Это позволяет эффективно очищать вещи, сохраняя их внешний вид и свойства ткани.', 'chemistry', 'Иллюстрация профессиональных средств для чистки'],
    ['Опытные технологи', 'Перед обработкой сложные и деликатные изделия оценивают специалисты. Они определяют подходящий способ чистки, обращают внимание на особенности ткани, фурнитуры, декора и возможные риски.', 'ironing', 'Сотрудник работает в производственном цехе UNISEC'],
    ['Финальный контроль', 'Перед выдачей мы оцениваем внешний вид изделия, качество обработки и глажки, после чего честно сообщаем Вам о результате.', 'finished', 'Одежда в фирменных чехлах UNISEC']
  ];
  why.innerHTML = `<div class="container"><div class="section-head"><div><p class="eyebrow">/ ПОЧЕМУ UNISEC</p><h2>Доверие<br><em>в деталях.</em></h2></div><p class="section-intro">Мы не обещаем невозможного. Мы просто внимательно делаем свою работу — на каждом этапе.</p></div><div class="why-grid benefits-v14">${benefits.map(([title, body, file, alt], i) => `<article class="benefit-v14">${file ? image(file, alt, 'benefit-v14-image') : ''}<div class="benefit-v14-copy"><span>${String(i + 1).padStart(2, '0')}</span><h3>${title}</h3><p>${body}</p></div></article>`).join('')}</div></div>`;
  about.after(why);

  const heading = process.querySelector('h2');
  if (heading) { heading.innerHTML = 'От приёмки<br><em>до идеального результата.</em>'; heading.insertAdjacentHTML('afterend', '<p class="process-v14-subtitle">Что происходит с вашей вещью на фабрике</p>'); }
  const eyebrow = process.querySelector('.eyebrow');
  if (eyebrow) eyebrow.textContent = '/ ПУТЬ ВАШЕЙ ВЕЩИ';
  const introduction = process.querySelector('.section-intro');
  if (introduction) introduction.textContent = 'Каждая вещь проходит свой путь. Мы подбираем технологию индивидуально и контролируем каждый этап — от осмотра до финальной подготовки.';
  const customerProcess = {
    reception: ['assets/images/customer-2026/11-entrance-client.webp', 1536, 1024, 'Клиент передаёт вещи сотруднице UNISEC'],
    tagging: ['assets/images/customer-2026/10-branch-hours.webp', 1215, 1199, 'Одежда в чехлах с бирками UNISEC'],
    process: ['assets/images/customer-2026/13-branch-collage.webp', 1024, 624, 'Сотрудники работают с промышленным оборудованием'],
    cleaning: ['assets/images/customer-2026/08-promo-collect-clean-return.webp', 1086, 1448, 'Работа с оборудованием UNISEC'],
    ironing: ['assets/images/customer-2026/14-garment-treatment.webp', 1536, 1024, 'Специалист выполняет финальную обработку одежды'],
    finished: ['assets/images/customer-2026/07-covered-garments-detail.webp', 1448, 1086, 'Одежда в фирменных чехлах UNISEC']
  };
  const processSources = {
    reception: ['assets/images/customer-2026/11-entrance-client.webp', 1536, 1024, 'Клиент передаёт вещи сотруднице UNISEC'],
    tagging: ['assets/images/customer-2026/10-branch-hours.webp', 1215, 1199, 'Одежда в чехлах с бирками UNISEC'],
    process: ['assets/images/customer-2026/13-branch-collage.webp', 1024, 624, 'Сотрудники работают с промышленным оборудованием'],
    cleaning: ['assets/images/customer-2026/08-promo-collect-clean-return.webp', 1086, 1448, 'Работа с оборудованием UNISEC'],
    ironing: ['assets/images/customer-2026/14-garment-treatment.webp', 1536, 1024, 'Специалист выполняет финальную обработку одежды'],
    finished: ['assets/images/customer-2026/07-covered-garments-detail.webp', 1448, 1086, 'Одежда в фирменных чехлах UNISEC']
  };
  const steps = [
    ['Приём и осмотр', 'Фиксируем особенности изделия, материал и загрязнения.', 'reception', processSources.reception[3]],
    ['Маркировка и передача на фабрику', 'Вещь получает индивидуальную бирку и поступает в работу.', 'tagging', processSources.tagging[3]],
    ['Подбор технологии', 'Технолог определяет оптимальный способ чистки.', 'process', processSources.process[3]],
    ['Чистка и обработка', 'Удаление загрязнений с учётом ткани, цвета и отделки.', 'cleaning', processSources.cleaning[3]],
    ['Глажка и финальная подготовка', 'Отпаривание, восстановление формы, аккуратная упаковка.', 'ironing', processSources.ironing[3]],
    ['Контроль качества и возврат', 'Вещь проверяется и возвращается в пункт на Чечёрском проезде.', 'finished', processSources.finished[3]]
  ];
  // Keep the large interactive preview in sync with the illustrations shown
  // on the step cards. Register both responsive variants with their real
  // widths: changing only img.src leaves an old srcset active in browsers.
  const dimensions = {
    reception: [1536, 1024],
    tagging: [1215, 1199],
    process: [1024, 624],
    cleaning: [1086, 1448],
    ironing: [1536, 1024],
    finished: [1448, 1086]
  };
  Object.entries(processSources).forEach(([name, [src, width, height]]) => {
    imageAssets[src] = {width, height, variants: [{src, width, height}]};
  });
  process.querySelector('.process-layout')?.classList.add('process-v14');
  process.querySelectorAll('.process-step').forEach((step, i) => {
    if (!steps[i]) return;
    const [title, detail, file, alt] = steps[i];
    step.dataset.img = processSources[file][0];
    step.dataset.caption = title;
    step.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b><span><strong>${title}</strong><small>${detail}</small></span><img class="process-v14-image" src="${processSources[file][0]}" alt="${alt}" loading="lazy" decoding="async" width="${processSources[file][1]}" height="${processSources[file][2]}"><i aria-hidden="true">↗</i>`;
  });
  const preview = process.querySelector('#process-img');
  if (preview) {
    preview.src = processSources[steps[0][2]][0]; preview.width = processSources[steps[0][2]][1]; preview.height = processSources[steps[0][2]][2];
    preview.alt = steps[0][3];
    const caption = process.querySelector('#process-caption');
    if (caption) caption.textContent = steps[0][0];
  }
})();
