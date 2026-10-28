(() => {
  for (const scene of ['story', 'how']) setup(scene);
  function setup(scene) {
    const reader=document.getElementById(`${scene}-reader`),rail=document.getElementById(`${scene}-rail`);
    const prev=document.getElementById(`${scene}-prev`),next=document.getElementById(`${scene}-next`);
    const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
    let position=0,target=0,max=0,frame=0,last=0,stops=[0], easing=13;
    const tail=document.createElement('span');
    tail.setAttribute('aria-hidden','true');
    tail.style.cssText='position:absolute;top:0;width:1px;height:1px;pointer-events:none';
    rail.appendChild(tail);
    const clamp=value=>Math.max(0,Math.min(max,value));
    function progress(){
      const p=max?rail.scrollLeft/max:0;
      document.getElementById(`${scene}-progress-fill`).style.transform=`scaleX(${p})`;
      document.getElementById(`${scene}-progress-label`).textContent=`${Math.round(p*100)}%`;
      prev.disabled=rail.scrollLeft<2;next.disabled=rail.scrollLeft>=max-2;
    }
    function cancel(){cancelAnimationFrame(frame);frame=0;last=0;position=target=rail.scrollLeft;}
    function tick(now){
      const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
      // One frame-rate-independent spring-like easing loop, without stacking
      // native smooth-scroll animations or adding to the trackpad's own inertia.
      position+=(target-position)*(1-Math.exp(-dt*easing));
      if(Math.abs(target-position)<.2)position=target;
      rail.scrollLeft=position;progress();
      if(position!==target)frame=requestAnimationFrame(tick);
      else {frame=0;last=0;}
    }
    function move(value, speed=13){
      easing=speed;
      target=clamp(value);
      if(reduced()){position=target;rail.scrollLeft=target;progress();return;}
      if(!frame){position=rail.scrollLeft;last=0;frame=requestAnimationFrame(tick);}
    }
    function measure(){
      cancel();tail.style.left='0px';
      const logo=document.getElementById('corner-logo').getBoundingClientRect();
      // The approved transparent logo has a 13.3% left inset before its M.
      const aligned=logo.left+logo.width*.133;
      reader.style.setProperty('--reader-inset',`${aligned}px`);
      const railLeft=rail.getBoundingClientRect().left;
      const titles=[...reader.querySelectorAll('h1,h2,h3,.system-name')];
      const points=titles.map(title=>{
        const box=title.getClientRects()[0]||title.getBoundingClientRect();
        return Math.max(0,rail.scrollLeft+box.left-railLeft-aligned);
      }).sort((a,b)=>a-b);
      stops=[0];for(const point of points)if(point-stops.at(-1)>24)stops.push(point);
      const naturalMax=Math.max(0,rail.scrollWidth-rail.clientWidth);
      max=Math.max(naturalMax,stops.at(-1));
      // Give the last heading enough trailing space to align at the same margin.
      tail.style.left=`${max+rail.clientWidth-1}px`;
      max=Math.max(0,rail.scrollWidth-rail.clientWidth);
      stops=stops.map(clamp);if(max-stops.at(-1)>24)stops.push(max);
      position=target=clamp(rail.scrollLeft);progress();
    }
    // Freeze at the current position through the fade; reset only on re-entry.
    function hide(){cancel();reader.classList.remove('is-visible');reader.inert=true;}
    window.addEventListener('moira-background-reset',hide);
    window.addEventListener('moira-scene-change',hide);
    function show(){
      if(window.moiraScene!==scene)return;
      rail.scrollLeft=position=target=0;reader.inert=false;reader.classList.add('is-visible');measure();
    }
    document.getElementById(`${scene}-video`).addEventListener('ended',show);
    window.addEventListener('moira-scene-settled',event=>{if(event.detail===scene)show();});
    window.addEventListener('wheel',event=>{
      if(!reader.classList.contains('is-visible')||event.ctrlKey||event.target.closest('.settings-dock,input,textarea,dialog'))return;
      const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
      if(!delta)return;
      const unit=event.deltaMode===1?24:event.deltaMode===2?rail.clientWidth:1;
      event.preventDefault();move(target+delta*unit);
    },{passive:false});
    function turn(direction){
      const origin=frame?target:rail.scrollLeft;
      const point=direction>0?stops.find(p=>p>origin+3):[...stops].reverse().find(p=>p<origin-3);
      move(point===undefined?(direction>0?max:0):point,6.5);
    }
    prev.addEventListener('click',()=>turn(-1));next.addEventListener('click',()=>turn(1));
    rail.addEventListener('keydown',event=>{
      if(['ArrowRight','PageDown','ArrowLeft','PageUp','Home','End'].includes(event.key))event.preventDefault();
      if(event.key==='ArrowRight'||event.key==='PageDown')turn(1);
      if(event.key==='ArrowLeft'||event.key==='PageUp')turn(-1);
      if(event.key==='Home')move(0,6.5);if(event.key==='End')move(max,6.5);
    });
    // Native touch dragging and text selection can take over without fighting RAF.
    rail.addEventListener('pointerdown',cancel,{passive:true});
    rail.addEventListener('scroll',()=>{if(!frame){position=target=rail.scrollLeft;progress();}},{passive:true});
    window.addEventListener('resize',measure);document.fonts.ready.then(measure);
  }
})();
