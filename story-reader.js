(() => {
  const reader=document.getElementById('story-reader'),rail=document.getElementById('story-rail');
  const prev=document.getElementById('story-prev'),next=document.getElementById('story-next');
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function progress(){
    const max=Math.max(0,rail.scrollWidth-rail.clientWidth),p=max?rail.scrollLeft/max:0;
    document.getElementById('story-progress-fill').style.transform=`scaleX(${p})`;
    document.getElementById('story-progress-label').textContent=`${Math.round(p*100)}%`;
    prev.disabled=rail.scrollLeft<2;next.disabled=rail.scrollLeft>=max-2;
  }
  function hide(){reader.classList.remove('is-visible');reader.inert=true;rail.scrollLeft=0;progress();}
  document.getElementById('story-button').addEventListener('click',hide);
  window.addEventListener('moira-background-reset',hide);
  window.addEventListener('moira-scene-change',hide);
  document.getElementById('story-video').addEventListener('ended',()=>{
    if(window.moiraScene !== 'story')return;
    rail.scrollLeft=0;reader.inert=false;reader.classList.add('is-visible');progress();
  });
  // Trackpad horizontal deltas stay horizontal; wheel/vertical gestures map sideways.
  window.addEventListener('wheel',event=>{
    if(!reader.classList.contains('is-visible')||event.ctrlKey||event.target.closest('.settings-dock, input, textarea'))return;
    const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    const unit=event.deltaMode===1?24:event.deltaMode===2?rail.clientWidth:1;
    event.preventDefault();rail.scrollLeft+=delta*unit;
  },{passive:false});
  function turn(direction){rail.scrollBy({left:direction*rail.clientWidth*.8,behavior:reduced()?'instant':'smooth'});}
  prev.addEventListener('click',()=>turn(-1));next.addEventListener('click',()=>turn(1));
  rail.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'||event.key==='PageDown'){event.preventDefault();turn(1);}
    if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();turn(-1);}
    if(event.key==='Home'){event.preventDefault();rail.scrollTo({left:0,behavior:reduced()?'instant':'smooth'});}
    if(event.key==='End'){event.preventDefault();rail.scrollTo({left:rail.scrollWidth,behavior:reduced()?'instant':'smooth'});}
  });
  rail.addEventListener('scroll',progress,{passive:true});
  window.addEventListener('resize',progress);
  document.fonts.ready.then(progress);
})();
