/**
 * admin.js — Panneau d'administration
 * Connecté à l'API Node.js → Supabase
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════
     CONFIG API
  ══════════════════════════════════════════ */
  const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://TON-BACKEND.onrender.com/api'; // ← remplacer par l'URL de ton serveur déployé

  /* ══════════════════════════════════════════
     MODULE API
  ══════════════════════════════════════════ */
  const Api = {
    _token: sessionStorage.getItem('admin_token') || null,

    setToken(t) {
      this._token = t;
      t ? sessionStorage.setItem('admin_token', t) : sessionStorage.removeItem('admin_token');
    },

    async request(method, path, body = null) {
      const headers = { 'Content-Type': 'application/json' };
      if (this._token) headers['Authorization'] = `Bearer ${this._token}`;

      const res  = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : null });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) { setState('LOGIN'); return null; }
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      return data;
    },

    get:    path        => Api.request('GET',    path),
    post:   (path, b)   => Api.request('POST',   path, b),
    put:    (path, b)   => Api.request('PUT',    path, b),
    delete: path        => Api.request('DELETE', path),
  };

  /* ══════════════════════════════════════════
     DOM
  ══════════════════════════════════════════ */
  const modal         = document.getElementById('adminModal');
  const loginSection  = document.getElementById('loginSection');
  const adminPanel    = document.getElementById('adminPanel');
  const loginMsg      = document.getElementById('loginMessage');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginBtn      = document.getElementById('loginBtn');

  /* ══════════════════════════════════════════
     STATE MACHINE
  ══════════════════════════════════════════ */
  let state     = 'CLOSED';
  let adminInfo = null;

  function setState(next) {
    state = next;
    switch (next) {
      case 'CLOSED':
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display  = 'none';
        loginMsg.textContent = '';
        usernameInput.value  = '';
        passwordInput.value  = '';
        break;

      case 'LOGIN':
        Api.setToken(null);
        adminInfo            = null;
        modal.style.display  = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        adminPanel.hidden    = true;
        loginSection.hidden  = false;
        requestAnimationFrame(() => usernameInput.focus());
        break;

      case 'PANEL':
        loginSection.hidden = true;
        adminPanel.hidden   = false;
        updateAdminBadge();
        loadData();
        showAdminSection('adminNews');
        break;
    }
  }

  window.adminOpen = () => setState('LOGIN');

  function updateAdminBadge() {
    const badge = document.getElementById('adminUserBadge');
    if (badge && adminInfo) badge.textContent = `${adminInfo.username} [${adminInfo.role.toUpperCase()}]`;
  }

  /* ══════════════════════════════════════════
     OUVRIR / FERMER
  ══════════════════════════════════════════ */
  document.getElementById('openAdminBtn')?.addEventListener('click',  () => setState('LOGIN'));
  document.getElementById('closeAdminBtn')?.addEventListener('click', () => setState('CLOSED'));
  modal.addEventListener('click', e => { if (e.target === modal) setState('CLOSED'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && state !== 'CLOSED') setState('CLOSED'); });

  /* Focus trap */
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const els = Array.from(modal.querySelectorAll('button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])')).filter(el => !el.hidden && el.offsetParent !== null);
    if (!els.length) return;
    if (e.shiftKey && document.activeElement === els[0])              { e.preventDefault(); els[els.length-1].focus(); }
    else if (!e.shiftKey && document.activeElement === els[els.length-1]) { e.preventDefault(); els[0].focus(); }
  });

  /* ══════════════════════════════════════════
     LOGIN / LOGOUT
  ══════════════════════════════════════════ */
  async function doLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (!username || !password) return;

    loginBtn.disabled    = true;
    loginBtn.textContent = 'CONNEXION...';
    loginMsg.textContent = '';

    try {
      const data = await Api.post('/auth/login', { username, password });
      if (!data) return;

      Api.setToken(data.token);
      adminInfo = data.admin;

      const exp = new Date(data.expiresAt);
      toast(`Connecté — session jusqu'à ${exp.toLocaleTimeString('fr-FR')}`);
      setState('PANEL');
    } catch (err) {
      loginMsg.textContent = `// ${err.message}`;
      passwordInput.value  = '';
      passwordInput.focus();
    } finally {
      loginBtn.disabled    = false;
      loginBtn.textContent = 'SE CONNECTER';
    }
  }

  async function doLogout() {
    try { await Api.post('/auth/logout'); } catch {}
    Api.setToken(null);
    setState('LOGIN');
  }

  loginBtn?.addEventListener('click', doLogin);
  passwordInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('logoutBtn')?.addEventListener('click', doLogout);

  /* ══════════════════════════════════════════
     ONGLETS ADMIN
  ══════════════════════════════════════════ */
  document.querySelector('.admin-tabs')?.addEventListener('click', e => {
    const btn = e.target.closest('.admin-tab');
    if (btn?.dataset.section) showAdminSection(btn.dataset.section);
  });

  function showAdminSection(id) {
    document.querySelectorAll('.adminSection').forEach(s => { s.hidden = s.id !== id; });
    document.querySelectorAll('.admin-tab').forEach(b => {
      const active = b.dataset.section === id;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active);
    });
    if (id === 'adminLogs' && adminInfo?.role === 'superadmin') loadLogs();
  }

  /* ══════════════════════════════════════════
     ACTUALITÉS
  ══════════════════════════════════════════ */
  document.getElementById('saveNewsBtn')?.addEventListener('click', async () => {
    const content = document.getElementById('newsEditor').value;
    try {
      await Api.put('/content/news', { content });
      renderNews(content);
      toast('Actualités sauvegardées !');
    } catch (err) { toast(err.message, true); }
  });

  function renderNews(html) {
    const el = document.getElementById('newsContent');
    if (el) el.innerHTML = html || '<p class="placeholder-text">// Pas encore d\'actualités disponibles.</p>';
  }

  /* ══════════════════════════════════════════
     ÉVÈNEMENTS
  ══════════════════════════════════════════ */
  document.getElementById('saveEventsBtn')?.addEventListener('click', async () => {
    const content = document.getElementById('eventsEditor').value;
    try {
      await Api.put('/content/events', { content });
      renderEvents(content);
      toast('Évènements sauvegardés !');
    } catch (err) { toast(err.message, true); }
  });

  function renderEvents(html) {
    const el = document.getElementById('eventsContent');
    if (el) el.innerHTML = html || '<p class="placeholder-text">// Pas encore d\'évènements programmés.</p>';
  }

  /* ══════════════════════════════════════════
     BOUTIQUE
  ══════════════════════════════════════════ */
  document.getElementById('addShopBtn')?.addEventListener('click', async () => {
    const title = document.getElementById('shopTitle').value.trim();
    const desc  = document.getElementById('shopDesc').value.trim();
    const price = parseFloat(document.getElementById('shopPrice').value);
    const img   = document.getElementById('shopImg').value.trim();

    if (!title || !desc || isNaN(price) || price < 0) { toast('Remplis tous les champs !', true); return; }

    try {
      await Api.post('/content/shop', { title, desc, price, img });
      ['shopTitle','shopDesc','shopPrice','shopImg'].forEach(id => { document.getElementById(id).value = ''; });
      const items = await Api.get('/content/shop');
      if (items) renderShop(items);
      toast('Article ajouté !');
    } catch (err) { toast(err.message, true); }
  });

  document.getElementById('shopPreview')?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-delete-id]');
    if (!btn) return;
    try {
      await Api.delete(`/content/shop/${btn.dataset.deleteId}`);
      const items = await Api.get('/content/shop');
      if (items) renderShop(items);
      toast('Article supprimé.');
    } catch (err) { toast(err.message, true); }
  });

  function renderShop(items) {
    const container = document.getElementById('shopContainer');
    if (container) {
      container.innerHTML = '';
      if (!items.length) {
        container.innerHTML = '<p class="placeholder-text" style="padding:20px;">// Aucun article disponible.</p>';
      } else {
        items.forEach(item => {
          const card = document.createElement('article');
          card.className = 'shop-item';
          if (item.img) {
            const img = document.createElement('img');
            img.src = escHtml(item.img); img.alt = escHtml(item.title); img.loading = 'lazy';
            card.appendChild(img);
          }
          const body = document.createElement('div'); body.className = 'shop-item-body';
          const h4 = document.createElement('h4'); h4.textContent = item.title;
          const p  = document.createElement('p');  p.textContent  = item.desc;
          const s  = document.createElement('strong'); s.textContent = `${parseFloat(item.price).toFixed(2)} €`;
          body.append(h4, p, s); card.appendChild(body); container.appendChild(card);
        });
      }
    }

    const preview = document.getElementById('shopPreview');
    if (!preview) return;
    preview.innerHTML = '';
    items.forEach(item => {
      const row = document.createElement('div'); row.className = 'shop-preview-item';
      if (item.img) { const img = document.createElement('img'); img.src = item.img; img.alt = ''; img.width = 54; img.height = 38; img.loading = 'lazy'; row.appendChild(img); }
      const span = document.createElement('span'); span.textContent = `${item.title} — ${parseFloat(item.price).toFixed(2)} €`;
      const del  = document.createElement('button'); del.textContent = 'SUPPRIMER'; del.dataset.deleteId = item.id; del.setAttribute('aria-label', `Supprimer ${item.title}`);
      row.append(span, del); preview.appendChild(row);
    });
  }

  /* ══════════════════════════════════════════
     LOGS (superadmin)
  ══════════════════════════════════════════ */
  async function loadLogs() {
    const logsEl = document.getElementById('logsContent');
    if (!logsEl) return;
    logsEl.innerHTML = '<p class="placeholder-text">// Chargement des logs...</p>';

    try {
      const [logins, actions, dashboard] = await Promise.all([
        Api.get('/logs/logins?limit=20'),
        Api.get('/logs/actions?limit=20'),
        Api.get('/logs/dashboard'),
      ]);

      logsEl.innerHTML = '';

      if (dashboard) {
        const stats = document.createElement('div'); stats.className = 'logs-stats';
        stats.innerHTML = `
          <div class="stat-card"><span class="stat-val">${dashboard.active_sessions}</span><span class="stat-lbl">Sessions actives</span></div>
          <div class="stat-card"><span class="stat-val">${dashboard.logins_24h}</span><span class="stat-lbl">Connexions 24h</span></div>
          <div class="stat-card stat-danger"><span class="stat-val">${dashboard.failed_logins_24h}</span><span class="stat-lbl">Échecs 24h</span></div>
          <div class="stat-card"><span class="stat-val">${dashboard.actions_24h}</span><span class="stat-lbl">Actions 24h</span></div>
        `;
        logsEl.appendChild(stats);
      }

      if (logins?.data?.length) {
        const h = document.createElement('p'); h.className = 'field-label'; h.style.margin = '18px 0 8px';
        h.textContent = 'DERNIÈRES CONNEXIONS'; logsEl.appendChild(h);
        logins.data.forEach(log => {
          const row = document.createElement('div');
          row.className = `log-row ${log.success ? 'log-ok' : 'log-err'}`;
          const d = new Date(log.created_at);
          row.innerHTML = `
            <span class="log-time">${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR')}</span>
            <span class="log-badge ${log.success ? 'badge-ok' : 'badge-err'}">${log.success ? 'OK' : 'ÉCHEC'}</span>
            <span class="log-user">${escHtml(log.username_try)}</span>
            <span class="log-ip">${log.ip_address || '—'}</span>
            ${!log.success ? `<span class="log-reason">${log.failure_reason || ''}</span>` : ''}
          `;
          logsEl.appendChild(row);
        });
      }

      if (actions?.data?.length) {
        const h = document.createElement('p'); h.className = 'field-label'; h.style.margin = '18px 0 8px';
        h.textContent = 'DERNIÈRES ACTIONS'; logsEl.appendChild(h);
        actions.data.forEach(log => {
          const row = document.createElement('div'); row.className = 'log-row';
          const d = new Date(log.created_at);
          row.innerHTML = `
            <span class="log-time">${d.toLocaleDateString('fr-FR')} ${d.toLocaleTimeString('fr-FR')}</span>
            <span class="log-badge badge-action">${escHtml(log.action)}</span>
            <span class="log-user">${escHtml(log.username)}</span>
            <span class="log-ip">${log.target || '—'}</span>
          `;
          logsEl.appendChild(row);
        });
      }
    } catch (err) {
      logsEl.innerHTML = `<p class="placeholder-text">// Erreur : ${err.message}</p>`;
    }
  }

  /* ══════════════════════════════════════════
     LOAD DATA
  ══════════════════════════════════════════ */
  async function loadData() {
    try {
      const [news, events, shop] = await Promise.all([
        Api.get('/content/news'),
        Api.get('/content/events'),
        Api.get('/content/shop'),
      ]);
      if (news)   { renderNews(news.content);   const el = document.getElementById('newsEditor');   if (el) el.value = news.content; }
      if (events) { renderEvents(events.content); const el = document.getElementById('eventsEditor'); if (el) el.value = events.content; }
      if (shop)   renderShop(shop);
    } catch (err) { console.warn('[admin] loadData:', err.message); }
  }

  window.loadData = loadData;

  /* ══════════════════════════════════════════
     TOAST
  ══════════════════════════════════════════ */
  let toastTimer;
  function toast(msg, isErr = false) {
    document.querySelector('.toast')?.remove();
    clearTimeout(toastTimer);
    const el = document.createElement('div');
    el.className = `toast toast--${isErr ? 'err' : 'ok'}`;
    el.textContent = msg;
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
    toastTimer = setTimeout(() => el.remove(), 2800);
  }

  /* ══════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════ */
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /* ── Init ── */
  setState('CLOSED');
  loadData();
  document.dispatchEvent(new Event('adminReady'));

})();
