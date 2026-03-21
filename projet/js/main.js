// ═══════════════════════════════════════════
//   MAIN.JS
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {

  // ─── TABS ────────────────────────────────
  const tabButtons = document.querySelectorAll('.tablinks');
  const tabContents = document.querySelectorAll('.tabcontent');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => {
        c.classList.remove('active-section');
        c.style.display = '';
      });

      const target = btn.getAttribute('data-target');
      const targetEl = document.getElementById(target);
      if (targetEl) {
        targetEl.classList.add('active-section');
        targetEl.style.display = 'block';
      }
      btn.classList.add('active');

      // scroll vers le haut du contenu
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ─── HEADER SCROLL ───────────────────────
  let lastScrollY = window.scrollY;
  const header    = document.getElementById('mainHeader');
  if (header) {
    header.style.transition = 'transform 0.28s ease, padding 0.28s ease';
    window.addEventListener('scroll', () => {
      const curr = window.scrollY;
      if (curr > lastScrollY && curr > 80) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }
      if (curr > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScrollY = curr;
    });
  }

  // ─── LOGO → retour live ──────────────────
  const homeBtn = document.getElementById('homeBtn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => {
        c.classList.remove('active-section');
        c.style.display = '';
      });
      const streamBtn = document.querySelector('[data-target="stream"]');
      const streamEl  = document.getElementById('stream');
      if (streamBtn) streamBtn.classList.add('active');
      if (streamEl)  { streamEl.classList.add('active-section'); streamEl.style.display = 'block'; }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── ADMIN via CTRL+A ────────────────────
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      const modal = document.getElementById('adminModal');
      if (modal) modal.classList.remove('hidden');
    }
  });

  // ─── Forcer le modal admin fermé au démarrage ─
  const adminModalEl = document.getElementById('adminModal');
  if (adminModalEl) {
    adminModalEl.classList.add('hidden');
    adminModalEl.style.display = 'none';
  }

  // ─── Charger les données au démarrage ────
  if (typeof loadData === 'function') loadData();

});
