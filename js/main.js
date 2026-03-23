/**
 * main.js — Navigation, scroll, initialisation
 * Optimisations :
 *  - Utilise l'attribut HTML `hidden` (plus performant que display:none via class)
 *  - Event delegation sur la nav (un seul listener)
 *  - IntersectionObserver à la place de scroll event pour le header
 *  - Année du footer calculée dynamiquement
 *  - Aucun onclick inline dans le HTML
 */
(function () {
  'use strict';

  /* ── Références DOM ── */
  const header    = document.getElementById('mainHeader');
  const nav       = document.getElementById('mainNav');
  const tabBtns   = nav.querySelectorAll('.tablinks');
  const sections  = document.querySelectorAll('.tabcontent');
  const homeBtn   = document.getElementById('homeBtn');
  const yearEl    = document.getElementById('currentYear');

  /* ── Année footer ── */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ══════════════════════════════════════════
     TABS — event delegation sur le nav
  ══════════════════════════════════════════ */
  nav.addEventListener('click', e => {
    const btn = e.target.closest('.tablinks');
    if (!btn) return;
    switchTab(btn.dataset.target);
  });

  function switchTab(targetId, scroll = true) {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    /* nav buttons */
    tabBtns.forEach(b => {
      const isTarget = b.dataset.target === targetId;
      b.classList.toggle('active', isTarget);
      b.setAttribute('aria-selected', isTarget);
    });

    /* sections — on utilise hidden natif */
    sections.forEach(s => {
      if (s.id === targetId) {
        s.removeAttribute('hidden');
        s.classList.add('active-section');
      } else {
        s.setAttribute('hidden', '');
        s.classList.remove('active-section');
      }
    });

    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Logo → retour live ── */
  homeBtn && homeBtn.addEventListener('click', e => {
    e.preventDefault();
    switchTab('stream');
  });

  /* ══════════════════════════════════════════
     HEADER SCROLL
     Utilise un IntersectionObserver sur une sentinelle invisible
     → zéro listener sur scroll, zéro recalcul de layout
  ══════════════════════════════════════════ */
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:200px;height:1px;width:1px;pointer-events:none;';
  document.body.prepend(sentinel);

  let lastScrollY = 0;

  const headerObs = new IntersectionObserver(([entry]) => {
    const scrollingDown = window.scrollY > lastScrollY;
    lastScrollY = window.scrollY;

    if (!entry.isIntersecting && scrollingDown) {
      header.classList.add('hide');
    } else {
      header.classList.remove('hide');
    }

    /* shrink sur scroll */
    header.classList.toggle('shrunk', window.scrollY > 50);
    document.body.classList.toggle('shrunk', window.scrollY > 50);
    nav.style.top = header.classList.contains('shrunk') ? '56px' : '';
  }, { threshold: 0 });

  headerObs.observe(sentinel);

  /* ══════════════════════════════════════════
     CTRL + A → ouvre admin
  ══════════════════════════════════════════ */
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      window.adminOpen?.();
    }
  });

  /* ══════════════════════════════════════════
     INITIALISATION
  ══════════════════════════════════════════ */
  /* S'assure que seule la section active est visible */
  switchTab('stream', false);

  /* Charge les données persistées (défini dans admin.js) */
  document.addEventListener('adminReady', () => {
    window.loadData?.();
  });

})();
