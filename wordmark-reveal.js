// Mist reveal adapted from the supplied React Bits FadeContent noise-mask approach.
(() => {
  function createMist(target, id) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
  document.body.appendChild(svg);
  function node(name, attrs, parent) {
    const el = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
    parent.appendChild(el); return el;
  }
  const filter = node('filter', {id, x:'-20%', y:'-30%', width:'140%', height:'160%', 'color-interpolation-filters':'sRGB'}, svg);
  node('feTurbulence', {type:'fractalNoise', baseFrequency:'.012', numOctaves:'3', seed:'19', result:'noise'}, filter);
  node('feColorMatrix', {in:'noise', type:'matrix', values:'0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.43 0 0 0 -0.21'}, filter);
  const curve=node('feFuncA',{type:'table'},node('feComponentTransfer',{result:'mask'},filter));
  node('feComposite',{in:'SourceGraphic',in2:'mask',operator:'in'},filter);
  const levels=Array.from({length:33},(_,i)=>1/(1+Math.exp(-10.8*(i/32-.5))));
  const clamp=v=>Math.max(0,Math.min(1,v));
  let frame, started=false;
  function reset(){cancelAnimationFrame(frame);started=false;target.classList.remove('is-visible');target.style.filter='';target.style.transform='';target.style.visibility='';}
  function start(){
    if(started)return;started=true;target.style.visibility='';target.classList.add('is-visible');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){
      if(id === 'moira-tagline-mist') window.dispatchEvent(new Event('moira-tagline-complete'));
      return;
    }
    const began=performance.now();
    function draw(now){
      const t=clamp((now-began)/2400), p=1-Math.pow(1-t,3), edge=.35, front=p*(1+2*edge)-edge;
      curve.setAttribute('tableValues',levels.map(level=>{const v=clamp((level-(front-edge))/(2*edge));return (1-v*v*(3-2*v)).toFixed(3)}).join(' '));
      target.style.filter=`url(#${id}) blur(${(10*(1-p)).toFixed(2)}px)`;
      target.style.transform=`translateY(${(7*(1-p)).toFixed(2)}px)`;
      if(t<1)frame=requestAnimationFrame(draw);else{target.style.filter='';target.style.transform='';
        if(id === 'moira-tagline-mist') window.dispatchEvent(new Event('moira-tagline-complete'));
      }
    }
    draw(began);
  }
  function hide(onComplete){
    cancelAnimationFrame(frame);
    started = true;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const began = performance.now();
    function draw(now){
      const t = reduced ? 1 : clamp((now-began)/1800);
      const p = 1-t*t*t, edge=.35, front=p*(1+2*edge)-edge;
      curve.setAttribute('tableValues',levels.map(level=>{const v=clamp((level-(front-edge))/(2*edge));return (1-v*v*(3-2*v)).toFixed(3)}).join(' '));
      target.style.filter=`url(#${id}) blur(${(10*(1-p)).toFixed(2)}px)`;
      target.style.transform=`translateY(${(-7*(1-p)).toFixed(2)}px)`;
      if(t<1) frame=requestAnimationFrame(draw);
      else {target.style.visibility='hidden';target.style.filter='';target.style.transform='';if(onComplete)onComplete();}
    }
    draw(began);
  }
  return {start,reset,hide};
  }
  window.moiraCreateMist = createMist;
  const wordmark = createMist(document.querySelector('.wordmark img'), 'moira-mist');
  const tagline = createMist(document.querySelector('.tagline'), 'moira-tagline-mist');
  const star = createMist(document.querySelector('.star-particles'), 'moira-star-mist');
  let exiting = false;
  window.addEventListener('moira-star-tagline-ready', () => {if(!exiting) tagline.start();});
  window.moiraReveal = {
    get isExiting(){return exiting;},
    showTagline: () => {if(!exiting)tagline.start();},
    start: () => {if(!exiting)wordmark.start();},
    hide: () => {exiting=true;wordmark.hide();tagline.hide();star.hide();},
    reset: () => {exiting=false;wordmark.reset();tagline.reset();star.reset();}
  };
})();
