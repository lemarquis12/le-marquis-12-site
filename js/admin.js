// ═══════════════════════════════════════════
//   ADMIN.JS
// ═══════════════════════════════════════════

// ─── OUVRIR / FERMER ─────────────────────
const adminModal    = document.getElementById('adminModal');
const loginSection  = document.getElementById('loginSection');
const adminPanel    = document.getElementById('adminPanel');
const loginMessage  = document.getElementById('loginMessage');

function openAdmin() {
  adminModal.classList.remove('hidden');
  adminModal.style.display = 'flex';
}
function closeAdmin() {
  adminModal.classList.add('hidden');
  adminModal.style.display = 'none';
}

// bouton Admin dans le header
const openAdminBtn = document.getElementById('openAdminBtn');
if (openAdminBtn) openAdminBtn.addEventListener('click', openAdmin);

// fermer
const closeBtn = document.getElementById('closeAdminBtn');
if (closeBtn) closeBtn.addEventListener('click', closeAdmin);

// fermer en cliquant sur l'overlay
adminModal && adminModal.addEventListener('click', e => {
  if (e.target === adminModal) closeAdmin();
});

// Ctrl+A
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    openAdmin();
  }
});

// ─── LOGIN ───────────────────────────────
function loginAdmin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (username === 'admin' && password === '1234') {
    loginSection.style.display = 'none';
    adminPanel.classList.remove('hidden');
    loadData();
  } else {
    loginMessage.textContent = '// IDENTIFIANT OU MOT DE PASSE INCORRECT';
  }
}

// Entrée → connexion
document.getElementById('password') &&
document.getElementById('password').addEventListener('keydown', e => {
  if (e.key === 'Enter') loginAdmin();
});

// ─── LOGOUT ──────────────────────────────
function logout() {
  loginSection.style.display = 'block';
  adminPanel.classList.add('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  loginMessage.textContent = '';
}

// ─── ONGLETS ADMIN ───────────────────────
function showAdminSection(sectionId, btn) {
  document.querySelectorAll('.adminSection').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(sectionId);
  if (el) el.classList.remove('hidden');
  if (btn) btn.classList.add('active');
}

// ─── ACTUALITÉS ──────────────────────────
function saveNews() {
  const news = document.getElementById('newsEditor').value;
  localStorage.setItem('newsContent', news);
  loadData();
  showToast('Actualités sauvegardées !');
}

// ─── ÉVÈNEMENTS ──────────────────────────
function saveEvents() {
  const events = document.getElementById('eventsEditor').value;
  localStorage.setItem('eventsContent', events);
  loadData();
  showToast('Évènements sauvegardés !');
}

// ─── BOUTIQUE : AJOUTER ──────────────────
function addShopItem() {
  const title = document.getElementById('shopTitle').value.trim();
  const desc  = document.getElementById('shopDesc').value.trim();
  const price = document.getElementById('shopPrice').value.trim();
  const img   = document.getElementById('shopImg').value.trim();

  if (!title || !desc || !price) {
    showToast('Remplis tous les champs !', true);
    return;
  }

  let shopItems = JSON.parse(localStorage.getItem('shopItems')) || [];
  shopItems.push({ title, desc, price, img });
  localStorage.setItem('shopItems', JSON.stringify(shopItems));

  document.getElementById('shopTitle').value = '';
  document.getElementById('shopDesc').value  = '';
  document.getElementById('shopPrice').value = '';
  document.getElementById('shopImg').value   = '';

  loadShop();
  showToast('Article ajouté !');
}

// ─── BOUTIQUE : SUPPRIMER ────────────────
function deleteShopItem(index) {
  let shopItems = JSON.parse(localStorage.getItem('shopItems')) || [];
  shopItems.splice(index, 1);
  localStorage.setItem('shopItems', JSON.stringify(shopItems));
  loadShop();
}

// ─── LOAD ALL DATA ────────────────────────
function loadData() {
  // Actualités
  const news = localStorage.getItem('newsContent');
  const newsContent = document.getElementById('newsContent');
  const newsEditor  = document.getElementById('newsEditor');
  if (newsContent) newsContent.innerHTML = news || '<p class="placeholder-text">// Pas encore d\'actualités disponibles.</p>';
  if (newsEditor)  newsEditor.value = news || '';

  // Évènements
  const events = localStorage.getItem('eventsContent');
  const eventsContent = document.getElementById('eventsContent');
  const eventsEditor  = document.getElementById('eventsEditor');
  if (eventsContent) eventsContent.innerHTML = events || '<p class="placeholder-text">// Pas encore d\'évènements programmés.</p>';
  if (eventsEditor)  eventsEditor.value = events || '';

  // Boutique
  loadShop();
}

// ─── LOAD SHOP ───────────────────────────
function loadShop() {
  const container = document.getElementById('shopContainer');
  const preview   = document.getElementById('shopPreview');
  const items     = JSON.parse(localStorage.getItem('shopItems')) || [];

  if (container) {
    container.innerHTML = '';
    if (items.length === 0) {
      container.innerHTML = '<p class="placeholder-text" style="padding:20px;">// Aucun article en boutique pour le moment.</p>';
    }
    items.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = `
        ${item.img ? `<img src="${item.img}" alt="${escapeHtml(item.title)}" loading="lazy">` : ''}
        <div class="shop-item-body">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.desc)}</p>
          <strong>${parseFloat(item.price).toFixed(2)} €</strong>
        </div>
      `;
      container.appendChild(div);
    });
  }

  if (preview) {
    preview.innerHTML = '';
    items.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'shop-preview-item';
      div.innerHTML = `
        ${item.img ? `<img src="${item.img}" alt="">` : ''}
        <span>${escapeHtml(item.title)} — ${parseFloat(item.price).toFixed(2)} €</span>
        <button onclick="deleteShopItem(${i})">SUPPRIMER</button>
      `;
      preview.appendChild(div);
    });
  }
}

// ─── TOAST NOTIFICATION ──────────────────
function showToast(msg, isError = false) {
  const existing = document.getElementById('adminToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'adminToast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px; right: 30px;
    background: ${isError ? 'rgba(204,0,34,0.9)' : 'rgba(10,79,255,0.9)'};
    color: #fff;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    letter-spacing: 1px;
    padding: 12px 22px;
    border: 1px solid ${isError ? '#ff1a35' : '#3d7aff'};
    z-index: 99999;
    clip-path: polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%);
    animation: toastIn 0.3s ease;
  `;

  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

// ─── UTILS ───────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}
