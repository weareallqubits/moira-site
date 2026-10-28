(() => {
  const canvas=document.getElementById('star-particles'),ctx=canvas.getContext('2d');
  const cx=1040,cy=135,star=new Path2D();
  for(let i=0;i<16;i++){
    const a=-Math.PI/2+i*Math.PI/8,r=i%2?28:i%4===0?128:88;
    const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
    if(i===0)star.moveTo(x,y);else star.lineTo(x,y);
  }
  star.closePath();
  let seed=17;const rand=()=>((seed=seed*16807%2147483647)-1)/2147483646;
  const particles=[];
  for(let y=cy-128;y<=cy+128;y+=7)for(let x=cx-128;x<=cx+128;x+=7){
    if(!ctx.isPointInPath(star,x,y))continue;
    const a=rand()*Math.PI*2,d=180+rand()*540;
    particles.push({x,y,sx:cx+Math.cos(a)*d,sy:cy+Math.sin(a)*d*.7,delay:rand()*.8,r:.8+rand()*2.2,bend:(rand()-.5)*240,phase:rand()*6.28});
  }
  // Soft sprites avoid hundreds of expensive per-particle shadow blurs.
  const sprite=document.createElement('canvas');sprite.width=sprite.height=64;
  const sc=sprite.getContext('2d'),g=sc.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'#fff9df');g.addColorStop(.08,'#fff1bc');g.addColorStop(.23,'#f9c568aa');g.addColorStop(.5,'#d58c2928');g.addColorStop(1,'#d58c2900');
  sc.fillStyle=g;sc.fillRect(0,0,64,64);
  let frame,started=false;
  function reset(){cancelAnimationFrame(frame);started=false;ctx.clearRect(0,0,4000,1340);}
  function start(){
    if(started)return;started=true;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,began=performance.now();
    let taglineReady = false;
    function draw(now){
      const elapsed=reduced?8:(now-began)/1000;
      if (elapsed >= 5.1 && !taglineReady) {
        taglineReady = true;
        window.dispatchEvent(new Event('moira-star-tagline-ready'));
      }
      ctx.clearRect(0,0,4000,1340);ctx.save();ctx.translate(1000,335);
      ctx.globalCompositeOperation='lighter';
      const blend=Math.max(0,Math.min(1,(elapsed-5.1)/1));
      for(const p of particles){
        const t=Math.max(0,Math.min(1,(elapsed-.05-p.delay)/4.9));if(!t)continue;
        const ease=1-Math.pow(1-t,3),swirl=Math.sin(t*Math.PI)*p.bend;
        const x=p.sx+(p.x-p.sx)*ease+swirl*.5,y=p.sy+(p.y-p.sy)*ease+swirl;
        const alpha=Math.min(1,t*6)*(1-blend)*(.65+.35*Math.sin(elapsed*5+p.phase));
        ctx.globalAlpha=alpha*.35;ctx.strokeStyle='#f1bf65';ctx.lineWidth=p.r*.55;
        ctx.beginPath();ctx.moveTo(x-(p.x-p.sx)*.035*(1-t),y-(p.y-p.sy)*.035*(1-t));ctx.lineTo(x,y);ctx.stroke();
        ctx.globalAlpha=alpha;const size=p.r*13;ctx.drawImage(sprite,x-size/2,y-size/2,size,size);
      }
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=blend;
      const gold=ctx.createLinearGradient(cx-100,cy-120,cx+100,cy+128);gold.addColorStop(0,'#fff0bd');gold.addColorStop(.45,'#f5cf86');gold.addColorStop(1,'#dba451');
      ctx.fillStyle=gold;ctx.shadowColor='#efb755';ctx.shadowBlur=22;ctx.fill(star);
      ctx.shadowBlur=55;ctx.globalAlpha=blend*.22;ctx.fill(star);
      ctx.restore();
      if(blend<1)frame=requestAnimationFrame(draw);
      else window.dispatchEvent(new Event('moira-star-complete'));
    }
    frame=requestAnimationFrame(draw);
  }
  window.moiraStar={start,reset};
})();
