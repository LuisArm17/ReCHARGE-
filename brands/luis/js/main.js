/* ============================================================
   /brands/luis/js/main.js
   Presentation-specific logic for Luis Hernán González
   ============================================================ */

'use strict';

import {
  initProgressBar,
  initCounters,
  initViewportVideos,
  initHoverVideos,
  initOrbAnimation,
  initChartOnViewport,
  initReveal,
} from '../../../shared/js/core.js';

/* ── LOAD DATA ── */
async function loadData() {
  try {
    const res  = await fetch('../../../data/luis.json');
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn('Could not load data/luis.json:', e);
    return null;
  }
}

/* ── INJECT DATA INTO DOM ── */
function injectData(data) {
  if (!data) return;

  const slots = {
    '[data-field="name"]':        data.name,
    '[data-field="role"]':        data.role,
    '[data-field="tagline"]':     data.tagline,
    '[data-field="experience"]':  data.experience,
    '[data-field="sessions"]':    data.sessions,
    '[data-field="phone"]':       data.phone,
    '[data-field="hero_subtitle"]': data.hero_subtitle,
  };

  Object.entries(slots).forEach(([selector, value]) => {
    document.querySelectorAll(selector).forEach(el => {
      el.textContent = value;
    });
  });

  // Links
  document.querySelectorAll('[data-href="whatsapp"]').forEach(el => {
    el.href = data.whatsapp;
  });
  document.querySelectorAll('[data-href="instagram"]').forEach(el => {
    el.href = data.instagram;
  });

  // KPIs
  if (data.kpis) {
    const kpiEls = document.querySelectorAll('[data-kpi]');
    kpiEls.forEach(el => {
      const idx = parseInt(el.dataset.kpi, 10);
      const kpi = data.kpis[idx];
      if (!kpi) return;
      const counter = el.querySelector('[data-counter]');
      if (counter) {
        counter.dataset.counter = kpi.value;
        counter.dataset.suffix  = kpi.suffix;
      }
      const label = el.querySelector('.kpi-label');
      if (label) label.textContent = kpi.label;
    });
  }

  // Tabs
  if (data.tabs) {
    data.tabs.forEach((tab, i) => {
      const panel = document.querySelector(`[data-tab-panel="${tab.id}"]`);
      if (!panel) return;
      const h = panel.querySelector('[data-tab-heading]');
      const p = panel.querySelector('[data-tab-body]');
      if (h) h.textContent = tab.heading;
      if (p) p.textContent = tab.body;
    });
  }

  // Immersive phrase
  if (data.immersive_phrase) {
    const phrase = document.querySelector('[data-immersive-phrase]');
    if (phrase) phrase.textContent = data.immersive_phrase;
  }

  // Closing
  if (data.closing_message) {
    const msg = document.querySelector('[data-closing-message]');
    if (msg) msg.textContent = data.closing_message;
  }
  if (data.closing_cta) {
    document.querySelectorAll('[data-closing-cta]').forEach(el => {
      el.textContent = data.closing_cta;
    });
  }
}

/* ── NAV SCROLL BEHAVIOR ── */
function initNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── HERO ENTRANCE ANIMATION ── */
function initHeroEntrance() {
  if (!window.gsap) return;

  const tl = gsap.timeline({ delay: 0.3 });
  tl
    .from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' })
    .from('.hero-title',   { opacity: 0, y: 40, duration: 1,   ease: 'power3.out' }, '-=0.4')
    .from('.hero-subtitle',{ opacity: 0, y: 30, duration: 0.9, ease: 'power3.out' }, '-=0.5')
    .from('.hero-ctas > *',{
      opacity: 0, y: 20, duration: 0.7,
      ease: 'power3.out', stagger: 0.12,
    }, '-=0.4')
    .from('.hero-scroll-hint', { opacity: 0, duration: 0.6 }, '-=0.2');
}

/* ── SCROLL-DRIVEN TABS ── */
function initScrollTabs(data) {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (!data || !data.tabs) return;

  const section  = document.getElementById('tabs-section');
  const panels   = document.querySelectorAll('.tab-panel');
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const phones   = document.querySelectorAll('.phone-mockup');
  if (!section || !panels.length) return;

  const tabCount = data.tabs.length;

  // Pin the section and distribute scroll across tabs
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: `+=${tabCount * 100}%`,
    pin: true,
    scrub: 1,
    onUpdate(self) {
      const idx = Math.min(
        Math.floor(self.progress * tabCount),
        tabCount - 1
      );

      // Activate correct panel
      panels.forEach((p, i) => {
        p.classList.toggle('is-active', i === idx);
      });

      // Activate correct tab button
      tabBtns.forEach((btn, i) => {
        btn.classList.toggle('is-active', i === idx);
      });

      // Activate correct phone mockup (stacked, same technique)
      phones.forEach((ph, i) => {
        gsap.to(ph, {
          opacity: i === idx ? 1 : 0,
          scale:   i === idx ? 1 : 0.92,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: true,
        });
      });
    },
  });

  // Manual tab click
  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      panels.forEach((p, j) => p.classList.toggle('is-active', j === i));
      tabBtns.forEach((b, j) => b.classList.toggle('is-active', j === i));
    });
  });
}

/* ── CLOSING PIN TRANSITION ── */
function initClosingPin() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const section  = document.getElementById('closing');
  const state1   = document.querySelector('.closing-state-1');
  const state2   = document.querySelector('.closing-state-2');
  if (!section || !state1 || !state2) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=150%',
      scrub: 1,
    },
  });

  tl
    .to(state1, { opacity: 0, y: -50, duration: 1, ease: 'power2.in' })
    .fromTo(
      state2,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0,  duration: 1, ease: 'power3.out' },
      '-=0.2'
    );
}

/* ── CHART CONFIG ── */
function buildChartConfig(data) {
  if (!data || !data.chart) return null;

  const { labels, datasets } = data.chart;
  const colors = ['#5b9bd5', '#84bef0'];

  return {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data:  ds.data,
        borderColor:     colors[i],
        backgroundColor: colors[i].replace(')', ', 0.06)').replace('rgb', 'rgba'),
        pointBackgroundColor: colors[i],
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2,
        tension: 0.45,
        fill: true,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 1800,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: {
          labels: {
            color: '#8a97ae',
            font: { family: 'DM Mono', size: 11 },
            boxWidth: 12,
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(10,15,26,0.95)',
          borderColor: 'rgba(91,155,213,0.3)',
          borderWidth: 1,
          titleColor: '#dde3ef',
          bodyColor: '#8a97ae',
          titleFont: { family: 'DM Mono', size: 11 },
          bodyFont:  { family: 'DM Mono', size: 11 },
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid:  { color: 'rgba(100,140,200,0.06)', drawBorder: false },
          ticks: { color: '#5e6b82', font: { family: 'DM Mono', size: 11 } },
          border: { display: false },
        },
        y: {
          min: 0,
          max: 100,
          grid:  { color: 'rgba(100,140,200,0.06)', drawBorder: false },
          ticks: {
            color: '#5e6b82',
            font: { family: 'DM Mono', size: 11 },
            callback: val => val + '%',
          },
          border: { display: false },
        },
      },
    },
  };
}

/* ── SCROLL REVEAL FOR SECTIONS ── */
function initSectionReveals() {
  if (!window.gsap || !window.ScrollTrigger) return;

  // Authority cards
  gsap.utils.toArray('.authority-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 50,
      duration: 0.9,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // KPI cards
  gsap.utils.toArray('.kpi-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 40,
      scale: 0.97,
      duration: 0.8,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Immersive phrase
  const phrase = document.querySelector('.immersive-phrase');
  if (phrase) {
    gsap.from(phrase, {
      opacity: 0,
      y: 60,
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: phrase,
        start: 'top 75%',
        toggleActions: 'play none none none',
      },
    });
  }

  // Section headers
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* ── VIDEO FALLBACK CHECK ── */
function initVideoFallbacks() {
  document.querySelectorAll('.phone-screen video').forEach(video => {
    const fallback = video.closest('.phone-screen').querySelector('.phone-screen-fallback');
    video.addEventListener('error', () => {
      if (fallback) {
        video.style.display = 'none';
        fallback.style.display = 'flex';
      }
    });
    // Also trigger if video has no src
    if (!video.src && !video.querySelector('source')) {
      video.style.display = 'none';
      if (fallback) fallback.style.display = 'flex';
    }
  });
}

/* ── MAIN ── */
async function main() {
  // Register GSAP plugins
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.defaults({ markers: false });
  }

  // Load dynamic data
  const data = await loadData();
  injectData(data);

  // Core shared helpers
  initProgressBar();
  initNav();
  initHeroEntrance();
  initViewportVideos();
  initHoverVideos();
  initReveal();
  initVideoFallbacks();

  // Bilateral orbs
  initOrbAnimation('orbs-hero');
  initOrbAnimation('orbs-immersive');

  // Scroll-driven tabs
  initScrollTabs(data);

  // Closing pin
  initClosingPin();

  // Section reveals
  initSectionReveals();

  // Animated counters
  initCounters();

  // Chart
  if (data) {
    const chartConfig = buildChartConfig(data);
    if (chartConfig) {
      initChartOnViewport('regulacion-chart', chartConfig);
    }
  }
}

// Boot on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
