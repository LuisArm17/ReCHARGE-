/* ============================================================
   /shared/js/core.js
   Shared helpers: progress bar, counters, viewport video,
   hover videos, bilateral orb animation
   ============================================================ */

'use strict';

/* ── PROGRESS BAR ── */
export function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  function update() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── ANIMATED COUNTERS (requires GSAP in global scope) ── */
export function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length || !window.gsap) return;

  counters.forEach(el => {
    const target   = parseFloat(el.dataset.counter) || 0;
    const suffix   = el.dataset.suffix || '';
    const decimals = Number.isInteger(target) ? 0 : 1;
    const proxy    = { val: 0 };

    const anim = gsap.fromTo(
      proxy,
      { val: 0 },
      {
        val: target,
        duration: 2,
        ease: 'power2.out',
        paused: true,
        onUpdate() {
          el.textContent =
            Math.round(proxy.val * Math.pow(10, decimals)) /
            Math.pow(10, decimals) +
            suffix;
        },
      }
    );

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          anim.play();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
  });
}

/* ── VIEWPORT VIDEO AUTOPLAY ── */
export function initViewportVideos() {
  const videos = document.querySelectorAll('[data-autoplay]');
  if (!videos.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.3 }
  );

  videos.forEach(v => {
    v.muted    = true;
    v.loop     = true;
    v.playsInline = true;
    observer.observe(v);
  });
}

/* ── HOVER VIDEOS (cards) ── */
export function initHoverVideos() {
  const cards = document.querySelectorAll('[data-hover-video]');
  if (!cards.length) return;

  cards.forEach(card => {
    const video = card.querySelector('video');
    if (!video) return;
    video.muted = true;
    video.loop  = true;
    video.playsInline = true;

    card.addEventListener('mouseenter', () => video.play().catch(() => {}));
    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

/* ── BILATERAL ORB ANIMATION ── */
export function initOrbAnimation(containerId) {
  const container = document.getElementById(containerId);
  if (!container || !window.gsap) return;

  const orbLeft  = container.querySelector('.orb--left');
  const orbRight = container.querySelector('.orb--right');
  if (!orbLeft || !orbRight) return;

  const containerW = container.offsetWidth || window.innerWidth;

  // Fade in orbs
  gsap.to([orbLeft, orbRight], {
    opacity: 1,
    duration: 2,
    ease: 'power2.out',
  });

  /* Left orb: starts far left, travels to center-left */
  const leftStart  = -orbLeft.offsetWidth * 0.5;
  const leftEnd    = containerW * 0.05;
  const rightStart = containerW - orbRight.offsetWidth * 0.5;
  const rightEnd   = containerW * 0.58;

  gsap.set(orbLeft,  { left: leftStart });
  gsap.set(orbRight, { left: rightStart });

  /* Smooth bilateral oscillation — never simultaneous extremes */
  const tl = gsap.timeline({ repeat: -1, yoyo: true });

  tl.to(orbLeft,  {
    left: leftEnd,
    duration: 6,
    ease: 'sine.inOut',
  }, 0)
    .to(orbRight, {
      left: rightEnd,
      duration: 6,
      ease: 'sine.inOut',
    }, 0);

  // Return the timeline so callers can control it
  return tl;
}

/* ── CHART INIT ON VIEWPORT ── */
export function initChartOnViewport(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart) return;

  let inited = false;
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && !inited) {
        inited = true;
        new Chart(canvas, config);
        observer.disconnect();
      }
    },
    { threshold: 0.3 }
  );
  observer.observe(canvas);
}

/* ── REVEAL ANIMATION ── */
export function initReveal() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  });
}
