// The same fractal-noise mask used by the wordmark, scaled for a scene.
(() => {
  const ns='http://www.w3.org/2000/svg';
  function node(name,attrs,parent){const n=document.createElementNS(ns,name);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);parent.appendChild(n);return n;}
  const svg=node('svg',{'aria-hidden':'true',width:0,height:0},document.body);
  svg.style.cssText='position:absolute;width:0;height:0;pointer-events:none';
  const levels=Array.from({length:33},(_,i)=>1/(1+Math.exp(-10.8*(i/32-.5))));
  const clamp=x=>Math.max(0,Math.min(1,x));
  window.createSceneMist=(target,id)=>{
    const filter=node('filter',{id,x:'-5%',y:'-5%',width:'110%',height:'110%','color-interpolation-filters':'sRGB'},svg);
    node('feTurbulence',{type:'fractalNoise',baseFrequency:'.007',numOctaves:3,seed:19,result:'noise'},filter);
    node('feColorMatrix',{in:'noise',type:'matrix',values:'0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.43 0 0 0 -0.21'},filter);
    const curve=node('feFuncA',{type:'table'},node('feComponentTransfer',{result:'mask'},filter));
    node('feComposite',{in:'SourceGraphic',in2:'mask',operator:'in'},filter);
    return {
      render(p){
        const edge=.35,front=p*(1+2*edge)-edge;
        curve.setAttribute('tableValues',levels.map(level=>{const v=clamp((level-front+edge)/(2*edge));return(1-v*v*(3-2*v)).toFixed(3)}).join(' '));
        target.style.filter=`url(#${id}) blur(${(10*(1-p)).toFixed(2)}px)`;
      },
      clear(){target.style.filter='';}
    };
  };
})();
