/* Single-entry motion, local SVG glass, and no layout reads during scrolling. */
(() => {
  if (document.documentElement.dataset.motionVersion === '13') return;
  document.documentElement.dataset.motionVersion = '13';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const active=new Map(),seen=new WeakSet();
  const play=(element,frames,options={})=>{
    if(!element || reduce.matches || !element.animate || document.hidden) return;
    active.get(element)?.cancel();
    const animation=element.animate(frames,{duration:620,easing:'cubic-bezier(.22,1,.36,1)',...options});
    active.set(element,animation);
    animation.finished.catch(()=>{}).finally(()=>{if(active.get(element)===animation)active.delete(element);});
  };
  document.documentElement.classList.add('motion-enabled');
  const wallpaper=document.createElement('div');
  wallpaper.className='living-wallpaper';wallpaper.setAttribute('aria-hidden','true');
  wallpaper.innerHTML='<div class="glass-lens glass-one"></div><div class="glass-lens glass-two"></div>';
  document.body.prepend(wallpaper);
  mountLiquidGlass(wallpaper,reduce);
  const syncVisibility=()=>{
    document.documentElement.classList.toggle('motion-paused',document.hidden);
    if(document.hidden)active.forEach(animation=>animation.finish());
  };
  document.addEventListener('visibilitychange',syncVisibility);syncVisibility();

  const weaveObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('weave-visible');
    weaveObserver.unobserve(entry.target);
  }),{threshold:0,rootMargin:'0px 0px -35px 0px'});
  document.querySelectorAll('.section-head,.hero-copy,.factory-copy,.about-copy,.contact-copy,.final-inner>div:first-child').forEach((host,index)=>{
    host.classList.add('weave-host');
    const weave=document.createElementNS('http://www.w3.org/2000/svg','svg');
    weave.classList.add('section-weave');weave.setAttribute('aria-hidden','true');
    weave.setAttribute('viewBox','0 0 700 370');weave.setAttribute('preserveAspectRatio','none');
    [0,20,40].forEach(n=>{
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',`M-70 ${270+n} C160 ${420+n} 170 ${-100+n+index%2*20} 410 ${80+n} S650 ${350+n} 790 ${80+n}`);
      path.setAttribute('pathLength','1000');
      weave.appendChild(path);
    });
    host.prepend(weave);weaveObserver.observe(host);
  });
  document.querySelectorAll('h1,h2').forEach(heading=>{
    const nodes=[...heading.childNodes];
    heading.replaceChildren();
    let line;
    const makeLine=()=>{const mask=document.createElement('span');mask.className='motion-line';line=document.createElement('span');line.className='motion-line-inner';mask.appendChild(line);heading.appendChild(mask);};
    makeLine();nodes.forEach(node=>{if(node.nodeName==='BR'){node.remove();makeLine();}else line.appendChild(node);});
  });
  const targets=document.querySelectorAll('.section-head,.hero-copy,.trust-item,.factory-copy,.about-copy,.why-grid article,.review-card,.contact-copy,.map-card,.final-inner>div:first-child');
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting || seen.has(entry.target))return;
    const target=entry.target;
    seen.add(target);reveal.unobserve(target);
    target.dataset.motionReveals=String(Number(target.dataset.motionReveals||0)+1);
    const lines=target.querySelectorAll('.motion-line-inner');
    if(lines.length)lines.forEach((line,index)=>play(line,[{opacity:0,transform:'translateY(105%) skewY(3deg)'},{opacity:1,transform:'translateY(0) skewY(0)'}],{duration:1100,delay:index*130}));
    else play(target,[{opacity:.35,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}]);
  }),{threshold:0,rootMargin:'0px 0px -20px 0px'});
  targets.forEach(target=>reveal.observe(target));

  const progress=document.createElement('div');progress.className='scroll-progress';progress.setAttribute('aria-hidden','true');
  document.querySelector('.site-header').appendChild(progress);
  let maximum=1,scrollFrame=0,measureFrame=0;
  const measure=()=>{measureFrame=0;maximum=Math.max(1,document.documentElement.scrollHeight-innerHeight);queueScroll();};
  const queueMeasure=()=>{if(!measureFrame)measureFrame=requestAnimationFrame(measure);};
  const queueScroll=()=>{
    if(scrollFrame || reduce.matches)return;
    scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;progress.style.setProperty('--page-progress',Math.min(1,scrollY/maximum));});
  };
  addEventListener('scroll',queueScroll,{passive:true});
  addEventListener('resize',queueMeasure,{passive:true});
  new ResizeObserver(queueMeasure).observe(document.body);queueMeasure();


  ['#order-modal','#lightbox'].forEach(selector=>{
    const overlay=document.querySelector(selector),content=overlay.querySelector('.modal,img');
    let wasOpen=false;
    new MutationObserver(()=>{
      const isOpen=overlay.classList.contains('open');
      if(isOpen&&!wasOpen&&!content.classList.contains('price-modal'))play(content,[{opacity:.6,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:240});
      if(!isOpen)active.get(content)?.cancel();
      wasOpen=isOpen;
    }).observe(overlay,{attributes:true,attributeFilter:['class']});
  });
  new MutationObserver(()=>play(document.querySelector('.review-card'),[{opacity:.35,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:450})).observe(document.querySelector('#review-text'),{childList:true});
  const counterJobs=new Map();
  const finishCounters=()=>{counterJobs.forEach((job,element)=>{cancelAnimationFrame(job.frame);element.textContent=job.final;});counterJobs.clear();};
  const counters=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const element=entry.target;counters.unobserve(element);
    if(reduce.matches||document.hidden)return;
    const final=element.textContent,value=parseInt(final,10),suffix=final.includes('+')?'+':'',start=performance.now(),from=suffix?0:1900;
    const job={final,frame:0};counterJobs.set(element,job);
    const tick=now=>{const t=Math.min((now-start)/1450,1);element.textContent=Math.round(from+(value-from)*(1-Math.pow(1-t,3)))+suffix;
      if(t<1)job.frame=requestAnimationFrame(tick);else{element.textContent=final;counterJobs.delete(element);}};
    job.frame=requestAnimationFrame(tick);
  }),{threshold:.6});
  document.querySelectorAll('.numbers-grid strong').forEach(element=>counters.observe(element));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finishCounters();});
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  document.querySelectorAll('.service-card,.hero-visual,.factory-image,.about-image,.process-image').forEach(card=>{
    card.classList.add('tactile-photo');let frame=0,rect=null,x=0,y=0;
    const reset=()=>{cancelAnimationFrame(frame);frame=0;rect=null;card.style.removeProperty('--photo-x');card.style.removeProperty('--photo-y');};
    card.addEventListener('pointerenter',()=>{if(fine.matches&&!reduce.matches)rect=card.getBoundingClientRect();});
    card.addEventListener('pointermove',event=>{
      if(!fine.matches||reduce.matches||!rect)return;
      x=event.clientX;y=event.clientY;if(frame)return;
      frame=requestAnimationFrame(()=>{frame=0;card.style.setProperty('--photo-x',Math.max(-3,Math.min(3,(.5-(y-rect.top)/rect.height)*6))+'deg');card.style.setProperty('--photo-y',Math.max(-3,Math.min(3,((x-rect.left)/rect.width-.5)*6))+'deg');});
    });
    card.addEventListener('pointerleave',reset);card.addEventListener('pointercancel',reset);
    addEventListener('resize',reset,{passive:true});
    reduce.addEventListener('change',reset);
  });
  document.querySelectorAll('.hero-actions .btn,.header-cta').forEach(button=>{
    let frame=0,rect=null,x=0,y=0;
    const reset=()=>{cancelAnimationFrame(frame);frame=0;rect=null;button.style.translate='';};
    button.addEventListener('pointerenter',()=>{if(fine.matches&&!reduce.matches)rect=button.getBoundingClientRect();});
    button.addEventListener('pointermove',event=>{if(!rect||reduce.matches||!fine.matches)return;x=event.clientX;y=event.clientY;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;button.style.translate=((x-rect.left-rect.width/2)*.04)+'px '+((y-rect.top-rect.height/2)*.06)+'px';});});
    button.addEventListener('pointerleave',reset);button.addEventListener('pointercancel',reset);reduce.addEventListener('change',reset);
  });
  reduce.addEventListener('change',()=>{
    if(reduce.matches){active.forEach(animation=>animation.cancel());finishCounters();}else queueMeasure();
  });
})();
