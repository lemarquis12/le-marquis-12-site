// admin.js - full admin modal & storage editor
document.addEventListener('DOMContentLoaded', ()=>{

  const adminModal = document.getElementById('adminModal');
  const openAdminBtn = document.getElementById('openAdminBtn');

  // credentials
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'lemarquis12';

  if(!adminModal) return;

  function buildModal(){
    adminModal.innerHTML = `
      <div class="admin-window">
        <button class="admin-close-btn" id="closeAdminBtn">✖</button>
        <h2>Panneau Admin</h2>
        <div id="loginSection">
          <input id="username" placeholder="Nom d'utilisateur">
          <input id="password" type="password" placeholder="Mot de passe">
          <div style="margin-top:8px">
            <button id="loginBtn" class="admin-actions">Se connecter</button>
          </div>
          <p id="loginMessage" style="color:#f88"></p>
        </div>

        <div id="adminPanel" style="display:none; margin-top:12px;">
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <div style="flex:1;min-width:250px">
              <h3>Actualités</h3>
              <textarea id="newsEditor" rows="6"></textarea>
              <button class="admin-actions" id="saveNews">💾 Enregistrer</button>

              <h3 style="margin-top:12px">Évènements</h3>
              <textarea id="eventsEditor" rows="6"></textarea>
              <button class="admin-actions" id="saveEvents">💾 Enregistrer</button>

              <h3 style="margin-top:12px">Boutique</h3>
              <textarea id="shopEditor" rows="4"></textarea>
              <button class="admin-actions" id="saveShop">💾 Enregistrer</button>
            </div>

            <div style="flex:1;min-width:250px">
              <h3>Réseaux sociaux</h3>
              <input id="linkTwitchInput" placeholder="Twitch URL">
              <input id="linkYoutubeInput" placeholder="YouTube URL">
              <input id="linkTiktokInput" placeholder="TikTok URL">
              <input id="linkInstaInput" placeholder="Instagram URL">
              <button class="admin-actions" id="saveLinks">💾 Enregistrer</button>

              <h3 style="margin-top:12px">Logo / Images</h3>
              <input id="logoInput" placeholder="URL du logo (ou path image)"/>
              <input id="headerBgInput" placeholder="URL image header (optionnel)"/>
              <button class="admin-actions" id="saveImages">💾 Enregistrer</button>
            </div>
          </div>

          <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end">
            <button class="admin-actions" id="logoutBtn">🚪 Déconnexion</button>
            <button class="admin-actions" id="closeBtn">Fermer</button>
          </div>
        </div>
      </div>
    `;

    // hook events
    document.getElementById('closeAdminBtn').addEventListener('click', closeModal);
    document.getElementById('closeBtn').addEventListener('click', closeModal);
    document.getElementById('logoutBtn').addEventListener('click', () => {
      document.getElementById('loginSection').style.display='block';
      document.getElementById('adminPanel').style.display='none';
    });

    document.getElementById('loginBtn').addEventListener('click', ()=> {
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value.trim();
      const msg = document.getElementById('loginMessage');
      if(u===ADMIN_USER && p===ADMIN_PASS){
        msg.textContent = '';
        document.getElementById('loginSection').style.display='none';
        document.getElementById('adminPanel').style.display='block';
        loadAdminData();
      } else {
        msg.textContent = 'Identifiants incorrects.';
      }
    });

    // save buttons
    document.getElementById('saveNews').addEventListener('click', ()=> {
      localStorage.setItem('newsContent', document.getElementById('newsEditor').value);
      alert('Actualités enregistrées');
      refreshSiteContent();
    });
    document.getElementById('saveEvents').addEventListener('click', ()=> {
      localStorage.setItem('eventsContent', document.getElementById('eventsEditor').value);
      alert('Évènements enregistrés');
      refreshSiteContent();
    });
    document.getElementById('saveShop').addEventListener('click', ()=> {
      localStorage.setItem('shopContent', document.getElementById('shopEditor').value);
      alert('Boutique enregistrée');
      refreshSiteContent();
    });
    document.getElementById('saveLinks').addEventListener('click', ()=> {
      localStorage.setItem('linkTwitch', document.getElementById('linkTwitchInput').value);
      localStorage.setItem('linkYoutube', document.getElementById('linkYoutubeInput').value);
      localStorage.setItem('linkTiktok', document.getElementById('linkTiktokInput').value);
      localStorage.setItem('linkInsta', document.getElementById('linkInstaInput').value);
      alert('Liens enregistrés');
      refreshSiteContent();
    });
    document.getElementById('saveImages').addEventListener('click', ()=> {
      localStorage.setItem('logoURL', document.getElementById('logoInput').value);
      localStorage.setItem('headerBgURL', document.getElementById('headerBgInput').value);
      alert('Images enregistrées');
      refreshSiteContent();
    });
  }

  function loadAdminData(){
    document.getElementById('newsEditor').value = localStorage.getItem('newsContent')||'';
    document.getElementById('eventsEditor').value = localStorage.getItem('eventsContent')||'';
    document.getElementById('shopEditor').value = localStorage.getItem('shopContent')||'';
    document.getElementById('linkTwitchInput').value = localStorage.getItem('linkTwitch')||document.getElementById('linkTwitch').href;
    document.getElementById('linkYoutubeInput').value = localStorage.getItem('linkYoutube')||document.getElementById('linkYoutube').href;
    document.getElementById('linkTiktokInput').value = localStorage.getItem('linkTiktok')||document.getElementById('linkTiktok').href;
    document.getElementById('linkInstaInput').value = localStorage.getItem('linkInsta')||document.getElementById('linkInsta').href;
    document.getElementById('logoInput').value = localStorage.getItem('logoURL')||document.querySelector('.top-header .logo').src;
    document.getElementById('headerBgInput').value = localStorage.getItem('headerBgURL')||'';
  }

  function openModal(){
    adminModal.classList.remove('hidden');
    buildModal();
  }
  function closeModal(){
    adminModal.classList.add('hidden');
    adminModal.innerHTML='';
  }

  openAdminBtn.addEventListener('click', openModal);

});

