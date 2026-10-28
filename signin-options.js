(() => {
  const options=document.getElementById('signin-options');
  function hide(){options.classList.remove('is-visible');options.inert=true;}
  window.addEventListener('moira-scene-change',hide);
  window.addEventListener('moira-background-reset',hide);
  document.getElementById('signin-video').addEventListener('ended',()=>{
    if(window.moiraScene!=='signin')return;
    options.inert=false;options.classList.add('is-visible');
  });
})();
