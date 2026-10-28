(() => {
  // Sparse, stationary lights; only their luminosity responds to the pointer.
  const canvas=document.createElement('canvas');
  canvas.id='how-lights';canvas.setAttribute('aria-hidden','true');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:1000;pointer-events:none;opacity:0;transition:opacity .8s ease';
  document.querySelector('.background').appendChild(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mouse={x:-1000,y:-1000};
  let active=false,frame=0,last=0,width=0,height=0,points=[];
  const sprite=document.createElement('canvas');sprite.width=sprite.height=64;
  const sc=sprite.getContext('2d'),gradient=sc.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'#fff9e9');gradient.addColorStop(.07,'#fff1ce');
  gradient.addColorStop(.2,'#ffdc9888');gradient.addColorStop(.55,'#edb76a25');gradient.addColorStop(1,'#edb76a00');
  sc.fillStyle=gradient;sc.fillRect(0,0,64,64);
  function resize(){
    width=innerWidth;height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,1.75);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    let seed=271;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
    const count=Math.min(230,Math.max(65,Math.round(width*height/6500)));
    points=Array.from({length:count},()=>({x:random()*width,y:random()*height,r:.35+random()*.55,base:.12+random()*.18,light:0}));
    wake();
  }
  function draw(now){
    frame=0;if(!active)return;
    const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
    const ease=reduce.matches?1:1-Math.exp(-dt*7);
    ctx.clearRect(0,0,width,height);
    let settling=false;
    for(const p of points){
      const distance=Math.hypot(mouse.x-p.x,mouse.y-p.y);
      const near=Math.max(0,1-distance/150),target=near*near;
      p.light+=(target-p.light)*ease;
      if(Math.abs(target-p.light)>.002)settling=true;
      // A restrained warm halo, with a tiny pin-sharp ivory core.
      const size=5+p.light*29;
      ctx.globalAlpha=Math.min(1,p.light*1.3);ctx.drawImage(sprite,p.x-size/2,p.y-size/2,size,size);
      ctx.globalAlpha=Math.min(1,p.base+p.light*.95);ctx.fillStyle='#fff1d4';
      ctx.beginPath();ctx.arc(p.x,p.y,p.r+p.light*.5,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    if(settling)frame=requestAnimationFrame(draw);else last=0;
  }
  function wake(){if(active&&!frame)frame=requestAnimationFrame(draw);}
  function hide(){active=false;cancelAnimationFrame(frame);frame=0;last=0;canvas.style.opacity='0';}
  function show(){if(window.moiraScene!=='how')return;active=true;canvas.style.opacity='1';resize();}
  document.getElementById('how-video').addEventListener('ended',show);
  window.addEventListener('moira-scene-settled',event=>{if(event.detail==='how')show();});
  window.addEventListener('moira-scene-change',hide);
  window.addEventListener('moira-background-reset',hide);
  window.addEventListener('resize',resize);
  window.addEventListener('pointermove',event=>{mouse.x=event.clientX;mouse.y=event.clientY;wake();},{passive:true});
  window.addEventListener('pointerdown',event=>{mouse.x=event.clientX;mouse.y=event.clientY;wake();},{passive:true});
  function leave(){mouse.x=mouse.y=-1000;wake();}
  document.documentElement.addEventListener('pointerleave',leave);
  window.addEventListener('pointerup',event=>{if(event.pointerType!=='mouse')leave();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();});
})();
