(() => {
  const intro = document.getElementById('intro');
  const holds = ['hold-a', 'hold-b'].map(id => document.getElementById(id));
  const opening = document.getElementById('open-video');
  const begin = document.getElementById('begin-button');
  const cornerLogo = document.getElementById('corner-logo');
  const nav = document.getElementById('main-nav');
  let navTimer;
  function resetHeader() {
    clearTimeout(navTimer);
    nav.classList.remove('is-visible');
    nav.inert = true;
    cornerLogo.classList.remove('is-visible');
  }
  function revealCornerLogo() {
    if (openRequested && (opening.ended || (Number.isFinite(opening.duration) && opening.currentTime >= Math.max(0, opening.duration - 1.8)))) {
      if (!cornerLogo.classList.contains('is-visible')) {
        cornerLogo.classList.add('is-visible');
        navTimer = setTimeout(() => {
          nav.classList.add('is-visible');
          nav.inert = false;
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1800);
      }
    }
  }
  opening.addEventListener('timeupdate', revealCornerLogo);
  opening.addEventListener('ended', revealCornerLogo);
  opening.muted = true;
  opening.defaultMuted = true;
  let openRequested = false, openBlend = null, opened = false;
  begin.addEventListener('click', async () => {
    if (openRequested) return;
    openRequested = true;
    resetHeader();
    begin.disabled = true;
    document.getElementById('begin-wrap').classList.remove('is-visible');
    window.moiraReveal.hide();
    const version = epoch;
    try {
      opening.style.zIndex = '3';
      opening.style.opacity = '0';
      opening.currentTime = 0;
      await opening.play();
      if ('requestVideoFrameCallback' in opening) {
        await new Promise(resolve => opening.requestVideoFrameCallback(resolve));
      } else if (opening.readyState < 2) {
        await new Promise(resolve => opening.addEventListener('loadeddata', resolve, { once: true }));
      }
      if (version !== epoch) return;
      openBlend = { start: opening.currentTime, duration: Math.min(1.8, (opening.duration - opening.currentTime) / 2) };
    } catch {
      if (version !== epoch) return;
      resetHeader();
      openRequested = false;
      begin.disabled = false;
      window.moiraReveal.reset();
      window.moiraReveal.start();
      window.moiraReveal.showTagline();
      document.getElementById('begin-wrap').classList.add('is-visible');
      opening.style.opacity = '0';
    }
  });
  holds.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.defaultPlaybackRate = 0.75;
    video.playbackRate = 0.75;
  });
  let active = intro, busy = false, blend = null, epoch = 0;
  // Crossfade lengths are in real seconds, independent of playback speed.
  const overlap = video => Math.min(video === intro ? 1.2 : 1.8, video.duration / video.playbackRate / 3);

  async function transition(incoming) {
    busy = true;
    const version = epoch;
    const outgoing = active;
    try {
      incoming.pause();
      incoming.currentTime = 0;
      incoming.style.opacity = '0';
      incoming.style.zIndex = '2';
      outgoing.style.zIndex = '1';
      await incoming.play();
      // Do not expose a blank frame while the incoming video decodes or buffers.
      if ('requestVideoFrameCallback' in incoming) {
        await new Promise(resolve => incoming.requestVideoFrameCallback(resolve));
      } else if (incoming.readyState < 2) {
        await new Promise(resolve => incoming.addEventListener('loadeddata', resolve, { once: true }));
      }
      if (version !== epoch) return;
      blend = { incoming, outgoing, start: incoming.currentTime, duration: overlap(outgoing) };
    } catch {
      if (version === epoch) busy = false;
      // Leave the current frame visible if the next video cannot play.
    }
  }

  function tick() {
    if (openBlend) {
      const progress = Math.min(1, Math.max(0, (opening.currentTime - openBlend.start) / openBlend.duration));
      opening.style.opacity = String(progress * progress * (3 - 2 * progress));
      if (progress >= 1) {
        [intro, ...holds].forEach(video => { video.pause(); video.style.opacity = '0'; });
        blend = null;
        openBlend = null;
        opened = true;
      }
    }
    if (opened) { requestAnimationFrame(tick); return; }
    if (blend) {
      // Media time prevents the fade advancing past a stalled incoming frame.
      const progress = Math.min(1, Math.max(0, (blend.incoming.currentTime - blend.start) / blend.incoming.playbackRate / blend.duration));
      const eased = progress * progress * (3 - 2 * progress);
      blend.incoming.style.opacity = String(eased);
      // Outgoing remains opaque underneath, so there is no brightness dip.
      if (progress >= 1) {
        // Let the hidden intro reach ended so wordmark delay settings still work.
        if (blend.outgoing !== intro) blend.outgoing.pause();
        blend.outgoing.style.opacity = '0';
        blend.outgoing.style.zIndex = '0';
        active = blend.incoming;
        active.style.zIndex = '1';
        blend = null;
        busy = false;
      }
    } else if (!openRequested && !busy && Number.isFinite(active.duration) && active.currentTime >= active.duration - overlap(active) * active.playbackRate) {
      const incoming = active === holds[0] ? holds[1] : holds[0];
      if (incoming.readyState >= 2) transition(incoming);
    }
    requestAnimationFrame(tick);
  }
  window.moiraBackground = {
    reset() {
      window.dispatchEvent(new Event('moira-background-reset'));
      epoch++;
      blend = null;
      busy = false;
      active = intro;
      resetHeader();
      openRequested = false;
      openBlend = null;
      opened = false;
      begin.disabled = false;
      opening.pause();
      opening.style.opacity = '0';
      opening.style.zIndex = '0';
      holds.forEach(video => { video.pause(); video.style.opacity = '0'; video.style.zIndex = '0'; });
      intro.style.opacity = '';
      intro.style.zIndex = '1';
    }
  };
  requestAnimationFrame(tick);
})();
