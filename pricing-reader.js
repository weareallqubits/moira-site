(() => {
  const reader=document.getElementById('pricing-reader'),dialog=document.getElementById('pricing-details');
  const video=document.getElementById('pricing-video');
  let revealFrame;
  function hide(){cancelAnimationFrame(revealFrame);reader.classList.remove('is-visible');reader.inert=true;if(dialog.open)dialog.close();}
  window.addEventListener('moira-scene-change',hide);
  window.addEventListener('moira-background-reset',hide);
  function show(){
    if(window.moiraScene!=='pricing')return;
    reader.inert=false;reader.classList.add('is-visible');
  }
  // Begin the existing fade roughly six frames before the final frame (30 fps).
  const revealLead=.2;
  function checkReveal(){
    if(window.moiraScene!=='pricing'||video.paused)return;
    if(Number.isFinite(video.duration)&&video.currentTime>=video.duration-revealLead){show();return;}
    revealFrame=requestAnimationFrame(checkReveal);
  }
  video.addEventListener('playing',()=>{cancelAnimationFrame(revealFrame);checkReveal();});
  video.addEventListener('ended',show);
  window.addEventListener('moira-scene-settled',event=>{if(event.detail==='pricing')show();});
  const tabs=[...reader.querySelectorAll('[data-plan]')],plans=[...reader.querySelectorAll('.pricing-plan')];
  function select(index){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;plans[i].classList.toggle('is-selected',i===index);});}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const n=(i+(event.key==='ArrowRight'?1:-1)+3)%3;select(n);tabs[n].focus();});});select(0);
  reader.querySelectorAll('[data-detail]').forEach(button=>button.addEventListener('click',()=>{
    dialog.showModal();
    const key=button.dataset.detail;
    const target=key.startsWith('pricing-detail-')?document.getElementById(key):dialog.querySelector('.'+key);
    if(target)target.scrollIntoView({block:'start'});
  }));
  document.getElementById('pricing-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
})();
