// Dissolve the current scene with the same noise mask used by the opening logo.
(() => {
  const logo=document.getElementById('corner-logo');
  const background=document.querySelector('.background');
  const overlay=document.createElement('canvas');
  overlay.setAttribute('aria-hidden','true');
  overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:100000;pointer-events:none;visibility:hidden';
  background.appendChild(overlay);
  const homeFrame=document.createElement('canvas');
  homeFrame.setAttribute('aria-hidden','true');
  homeFrame.style.cssText=overlay.style.cssText;homeFrame.style.zIndex='99999';
  background.appendChild(homeFrame);
  const mist=window.moiraCreateMist(overlay,'moira-return-mist');
  let returning=false;
  function returnHome(){
    if(returning||!['story','how','pricing','signin'].includes(window.moiraScene))return;
    returning=true;
    // Composite decoded video frames only. WebGL drawing buffers may be cleared
    // after presentation and copying them can produce an opaque black frame.
    const ratio=Math.min(devicePixelRatio||1,1.75);
    overlay.width=Math.round(innerWidth*ratio);overlay.height=Math.round(innerHeight*ratio);
    const ctx=overlay.getContext('2d');
    const layers=[...background.querySelectorAll('video')]
      .sort((a,b)=>(Number(a.style.zIndex)||0)-(Number(b.style.zIndex)||0));
    ctx.fillStyle='#020b24';ctx.fillRect(0,0,overlay.width,overlay.height);
    layers.forEach(el=>{
      const alpha=Number(getComputedStyle(el).opacity);
      if(!alpha||(el.tagName==='VIDEO'&&el.readyState<2))return;
      const w=el.videoWidth||el.width,h=el.videoHeight||el.height;
      if(!w||!h)return;
      const scale=Math.max(overlay.width/w,overlay.height/h);
      ctx.globalAlpha=alpha;
      ctx.drawImage(el,(overlay.width-w*scale)/2,(overlay.height-h*scale)/2,w*scale,h*scale);
    });
    ctx.globalAlpha=1;
    // Keep an opaque copy of B directly under A's dissolving mask throughout.
    const opening=document.getElementById('open-video');
    homeFrame.width=overlay.width;homeFrame.height=overlay.height;
    const home=homeFrame.getContext('2d');
    const scale=Math.max(homeFrame.width/opening.videoWidth,homeFrame.height/opening.videoHeight);
    home.drawImage(opening,(homeFrame.width-opening.videoWidth*scale)/2,(homeFrame.height-opening.videoHeight*scale)/2,opening.videoWidth*scale,opening.videoHeight*scale);
    homeFrame.style.visibility='visible';
    mist.reset();overlay.style.visibility='visible';
    window.moiraScene=null;
    window.dispatchEvent(new CustomEvent('moira-scene-change',{detail:'main'}));
    opening.style.opacity='1';
    const scenes=['story','how','pricing','signin'].map(scene=>document.getElementById(scene+'-video'));
    scenes.forEach(video=>video.style.opacity='0');
    mist.hide(()=>{homeFrame.style.visibility='hidden';scenes.forEach(video=>video.pause());returning=false;window.dispatchEvent(new CustomEvent('moira-scene-settled',{detail:'main'}));});
  }
  logo.addEventListener('click',returnHome);
  logo.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();returnHome();}});
  // A new navigation cancels the overlay without hiding the new destination.
  window.addEventListener('moira-scene-change',event=>{
    if(event.detail==='main'||!returning)return;
    mist.reset();overlay.style.visibility='hidden';homeFrame.style.visibility='hidden';returning=false;
  });
  window.addEventListener('moira-background-reset',()=>{mist.reset();overlay.style.visibility='hidden';homeFrame.style.visibility='hidden';returning=false;});
})();
