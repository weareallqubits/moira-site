(() => {
  let layer = 5;
  for (const scene of ['story', 'pricing', 'how', 'signin']) setup(scene);
  function setup(scene) {
  const video = document.getElementById(`${scene}-video`);
  const button = document.getElementById(`${scene}-button`);
  video.muted = true;
  video.defaultMuted = true;
  let frame, version = 0, busy = false;
  function waitFor(event) {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener(event, done);
        video.removeEventListener('error', fail);
      };
      const done = () => { cleanup(); resolve(); };
      const fail = () => { cleanup(); reject(new Error('Story video unavailable')); };
      video.addEventListener(event, done, { once: true });
      video.addEventListener('error', fail, { once: true });
    });
  }
  function reset() {
    version++;
    cancelAnimationFrame(frame);
    busy = false;
    button.disabled = false;
    video.pause();
    video.playbackRate = 1;
    video.style.opacity = '0';
    video.style.zIndex = '0';
  }
  window.addEventListener('moira-background-reset', () => {window.moiraScene = null; reset();});
  window.addEventListener('moira-scene-change', event => {
    if(event.detail === scene)return;
    version++;
    cancelAnimationFrame(frame);
    // Keep the outgoing footage moving until the incoming layer fully covers it.
    // The completed dissolve below owns pausing and hiding covered videos.
    busy=false;button.disabled=false;
  });
  button.addEventListener('click', async () => {
    if (busy || window.moiraScene === scene) return;
    const fromSection = ['story', 'pricing', 'how', 'signin'].includes(window.moiraScene);
    window.moiraScene = scene;
    window.dispatchEvent(new CustomEvent('moira-scene-change', {detail:scene}));
    busy = true;
    button.disabled = true;
    const current = ++version;
    try {
      video.pause();
        video.playbackRate = 1;
      if (video.currentTime !== 0) {
        const seek = waitFor('seeked');
        video.currentTime = 0;
        await seek;
      }
      // Pricing and How It Works get gentle speed ramps; Story stays constant.
      if (scene === 'pricing') video.playbackRate = 0.85;
      if (scene === 'how') video.playbackRate = 0.7;
      await video.play();
      if (current !== version) return;
      video.style.zIndex = String(++layer);
      const duration = fromSection ? Math.max(1, Number(document.getElementById('story-crossfade').value) * 1000) : (scene === 'story' ? 800 : scene === 'signin' ? 600 : 0);
      const began = performance.now();
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      function fade(now) {
        if (current !== version) return;
        const t = reduced || duration === 0 ? 1 : Math.min(1, (now - began) / duration);
        video.style.opacity = String(t * t * (3 - 2 * t));
        if (t < 1) frame = requestAnimationFrame(fade);
        else {
          document.getElementById('open-video').pause();
          for(const id of ['story-video', 'pricing-video', 'how-video', 'signin-video']) {
            const other=document.getElementById(id);
            if(other!==video){other.pause();other.style.opacity='0';}
          }
          frame = requestAnimationFrame(checkEnded);
        }
      }
      function checkEnded() {
        if (current !== version) return;
        if ((scene === 'pricing' || scene === 'how') && Number.isFinite(video.duration)) {
          const floor = scene === 'how' ? 0.7 : 0.85;
          const edge = Math.min(scene === 'how' ? 0.6 : 0.35, video.duration / 4);
          const t = Math.max(0, Math.min(1, video.currentTime / edge, (video.duration - video.currentTime) / edge));
          video.playbackRate = floor + (1 - floor) * t * t * (3 - 2 * t);
        }
        if (!video.ended) frame = requestAnimationFrame(checkEnded);
        else { busy = false; button.disabled = false; }
      }
      if (duration === 0) fade(began);
      else frame = requestAnimationFrame(fade);
    } catch {
      if (current === version) reset();
    }
  });
  }
})();
