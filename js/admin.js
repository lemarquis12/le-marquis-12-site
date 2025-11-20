// admin.js - secret combo, login, admin UI, shop add/delete
document.addEventListener('DOMContentLoaded', () => {
  const adminModal = document.getElementById('adminModal');
  const adminCloseBtn = document.getElementById('adminCloseBtn');
  const adminCloseBtn2 = document.getElementById('adminCloseBtn2');
  const adminLogin = document.getElementById('adminLogin');
  const adminUI = document.getElementById('adminUI');
  const loginBtn = document.getElementById('adminLoginBtn');
  const adminUser = document.getElementById('adminUser');
  const adminPass = document.getElementById('adminPass');
  const loginMsg = document.getElementById('adminLoginMsg');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'lemarquis12';

  // secret combo Ctrl+Alt+M
  document.addEventListener('keydown', (e) => {
    if(e.ctrlKey && e.altKey && e.key.toLowerCase() === 'm'){
      adminModal.classList.remove('hidden');
      adminLogin.style.display = 'block';
      adminUI.classList.add('hidden');
      loginMsg.textContent = '';
      adminUser.value = '';
      adminPass.value = '';
    }
  });

  // close handlers
  adminCloseBtn?.addEventListener('click', ()=> adminModal.classList.add('hidden'));
  adminCloseBtn2?.addEventListener('click', ()=> adminModal.classList.add('hidden'));
  adminLogoutBtn?.addEventListener('click', ()=> {
    adminUI.classList.add('hidden');
    adminLogin.style.display = 'block';
  });

  // login
  loginBtn?.addEventListener('click', ()=> {
    if(adminUser.value.trim() === ADMIN_USER && adminPass.value.trim() === ADMIN_PASS){
      adminLogin.style.display = 'none';
      adminUI.classList.remove('hidden');
      loadAdminData();
      hookAdminTabs();
    } else {
      loginMsg.textContent = 'Identifiants incorrects';
    }
  });

  // save news / events
  document.getElementById('saveNewsBtn')?.addEventListener('click', ()=> {
    localStorage.setItem('newsContent', document.getElementById('newsEditor').value);
    refreshSiteContent();
    alert('Actualités sauvegardées');
  });
  document.getElementById('saveEventsBtn')?.addEventListener('click', ()=> {
    localStorage.setItem('eventsContent', document.getElementById('eventsEditor').value);
    refreshSiteContent();
    alert('Évènements sauvegardés');
  });

  // add shop item with file -> dataURL
  document.getElementById('addShopBtn')?.addEventListener('click', ()=> {
    const title = document.getElementById('shopTitle').value.trim();
    const desc = document.getElementById('shopDesc').value.trim();
    const price = document.getElementById('shopPrice').value.trim();
    const fileInput = document.getElementById('shopImageFile');

    if(!title || !desc || !price){
      return alert('Remplis tous les champs');
    }
    if(!fileInput || !fileInput.files || !fileInput.files[0]){
      return alert('Sélectionne une image');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgData = e.target.result;
      const shop = JSON.parse(localStorage.getItem('shopItems') || '[]');
      shop.push({title, desc, price, img: imgData});
      localStorage.setItem('shopItems', JSON.stringify(shop));
      renderShopPreview();
      refreshSiteContent();
      // reset
      document.getElementById('shopTitle').value = '';
      document.getElementById('shopDesc').value = '';
      document.getElementById('shopPrice').value = '';
      fileInput.value = '';
      alert('Article ajouté');
    };
    reader.readAsDataURL(fileInput.files[0]);
  });

  // render preview list in admin
  function renderShopPreview(){
    const preview = document.getElementById('shopPreview');
    const shop = JSON.parse(localStorage.getItem('shopItems') || '[]');
    preview.innerHTML = '';
    shop.forEach((it, idx) => {
      const div = document.createElement('div');
      div.className = 'shop-preview-item';
      div.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center">
          <img src="${it.img}" style="width:70px;height:48px;object-fit:cover;border-radius:6px">
          <div>
            <strong style="display:block">${escapeHtml(it.title)}</strong>
            <small style="color:#ddd">${escapeHtml(it.price)} €</small>
          </div>
        </div>
        <div>
          <button data-idx="${idx}" class="deleteShopBtn" style="background:#333;color:#fff;border:0;padding:6px 8px;border-radius:6px;cursor:pointer">🗑️</button>
        </div>`;
      preview.appendChild(div);
    });
    document.querySelectorAll('.deleteShopBtn').forEach(btn => btn.addEventListener('click', ()=> {
      const idx = parseInt(btn.dataset.idx);
      deleteShopItem(idx);
    }));
  }

  function deleteShopItem(i){
    const shop = JSON.parse(localStorage.getItem('shopItems') || '[]');
    if(i>=0 && i<shop.length){
      shop.splice(i,1);
      localStorage.setItem('shopItems', JSON.stringify(shop));
      renderShopPreview();
      refreshSiteContent();
      alert('Article supprimé');
    }
  }

  // load admin data into editors
  function loadAdminData(){
    document.getElementById('newsEditor').value = localStorage.getItem('newsContent') || '';
    document.getElementById('eventsEditor').value = localStorage.getItem('eventsContent') || '';
    renderShopPreview();
  }

  // hook admin tabs
  function hookAdminTabs(){
    document.querySelectorAll('.admin-tab').forEach(tab => tab.addEventListener('click', ()=> {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.section;
      document.querySelectorAll('.admin-content').forEach(c => c.style.display = 'none');
      document.getElementById(target).style.display = 'block';
    }));
  }

  // escape helper
  function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

}); // end DOMContentLoaded
