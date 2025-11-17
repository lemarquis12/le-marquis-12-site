/* admin.js - panneau admin complet (modal) */
/* CONFIG */
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "lemarquis12"; // CHANGE-IT pour la prod

/* build modal HTML (sa structure) */
const adminModalRoot = document.getElementById("adminModal");
adminModalRoot.innerHTML = `
  <div class="admin-modal-content admin-window hidden" id="adminWindowInner">
    <button class="admin-close-btn small-btn" id="adminCloseBtn">✖</button>
    <h2>Panneau d'administration</h2>

    <div id="adminBox">
      <div class="admin-sections">
        <div class="admin-left">
          <div id="loginSection">
            <h3>Connexion</h3>
            <input id="admUser" placeholder="Nom d'utilisateur">
            <input id="admPass" type="password" placeholder="Mot de passe">
            <div style="margin-top:8px">
              <button id="admLoginBtn" class="admin-actions">Se connecter</button>
            </div>
            <p id="admMsg"></p>
          </div>

          <div id="adminContent" class="hidden">
            <h3>📰 Actualités</h3>
            <textarea id="admNews" rows="5" placeholder="Texte actualités..."></textarea>
            <div class="admin-actions">
              <button id="admSaveNews" class="admin-actions">Enregistrer actualités</button>
            </div>

            <h3>📅 Évènements</h3>
            <textarea id="admEvents" rows="4" placeholder="Texte événements..."></textarea>
            <div class="admin-actions">
              <button id="admSaveEvents" class="admin-actions">Enregistrer évènements</button>
            </div>
          </div>
        </div>

        <div class="admin-right">
          <div id="gallerySection" class="hidden">
            <h3>🖼 Images (galerie)</h3>
            <input id="imgFile" type="file" accept="image/*">
            <div style="margin-top:8px">
              <button id="imgUploadBtn" class="admin-actions">Uploader image</button>
            </div>
            <div class="gallery" id="galleryList"></div>
          </div>

          <div id="vodSection" class="hidden" style="margin-top:12px">
            <h3>🎬 VOD (ajout manuel)</h3>
            <input id="vodInput" placeholder='Ex: https://player.twitch.tv/?video=12345&parent=lemarquis12.github.io'>
            <input id="vodTitleInput" placeholder="Titre (optionnel)">
            <div style="margin-top:8px">
              <button id="addVodBtn" class="admin-actions">Ajouter VOD</button>
            </div>
            <div id="vodListAdmin" style="margin-top:8px"></div>
          </div>
        </div>
      </div>

      <div style="margin-top:14px;display:flex;gap:8px;justify-content:flex-end">
        <button id="admLogoutBtn" class="small-btn">Se déconnecter</button>
        <button id="admCloseBottom" class="small-btn">Fermer</button>
      </div>
    </div>
  </div>
`;

/* elements */
const adminWindowInner = document.getElementById("adminWindowInner");
const adminCloseBtn = document.getElementById("adminCloseBtn");
const admCloseBottom = document.getElementById("admCloseBottom");
const adminCloseOverlay = document.getElementById("adminModal");

const admLoginBtn = document.getElementById("admLoginBtn");
const admMsg = document.getElementById("admMsg");
const admUser = document.getElementById("admUser");
const admPass = document.getElementById("admPass");

const adminContent = document.getElementById("adminContent");
const gallerySection = document.getElementById("gallerySection");
const vodSection = document.getElementById("vodSection");

const admNews = document.getElementById("admNews");
const admSaveNews = document.getElementById("admSaveNews");
const admEvents = document.getElementById("admEvents");
const admSaveEvents = document.getElementById("admSaveEvents");

const imgFile = document.getElementById("imgFile");
const imgUploadBtn = document.getElementById("imgUploadBtn");
const galleryList = document.getElementById("galleryList");

const vodInput = document.getElementById("vodInput");
const vodTitleInput = document.getElementById("vodTitleInput");
const addVodBtn = document.getElementById("addVodBtn");
const vodListAdmin = document.getElementById("vodListAdmin");

const admLogoutBtn = document.getElementById("admLogoutBtn");

/* show/hide modal */
function showAdminModal(){
  adminModalRoot.classList.remove("hidden");
  adminWindowInner.classList.remove("hidden");
  adminModalRoot.setAttribute("aria-hidden","false");
  // if logged in in localStorage, directly show content
  if(localStorage.getItem("adminLogged")==="1"){
    showAdminContent();
  } else {
    document.getElementById("loginSection").style.display = "block";
    adminContent.classList.add("hidden");
  }
}
function hideAdminModal(){
  adminModalRoot.classList.add("hidden");
  adminWindowInner.classList.add("hidden");
  adminModalRoot.setAttribute("aria-hidden","true");
}

/* events for close */
adminCloseBtn.addEventListener("click", hideAdminModal);
admCloseBottom.addEventListener("click", hideAdminModal);
adminModalRoot.addEventListener("click", (e)=>{
  if(e.target===adminModalRoot) hideAdminModal();
});

/* login */
admLoginBtn.addEventListener("click", ()=>{
  const u = admUser.value.trim();
  const p = admPass.value;
  if(u===ADMIN_USERNAME && p===ADMIN_PASSWORD){
    admMsg.textContent = "Connexion OK";
    localStorage.setItem("adminLogged","1");
    showAdminContent();
  } else {
    admMsg.textContent = "Identifiants invalides";
  }
});

function showAdminContent(){
  document.getElementById("loginSection").style.display = "none";
  adminContent.classList.remove("hidden");
  gallerySection.classList.remove("hidden");
  vodSection.classList.remove("hidden");
  // fill editors
  admNews.value = localStorage.getItem("newsContent") || "";
  admEvents.value = localStorage.getItem("eventsContent") || "";
  renderGallery();
  renderVodAdmin();
}

/* logout */
admLogoutBtn.addEventListener("click", ()=>{
  localStorage.removeItem("adminLogged");
  hideAdminModal();
});

/* save news/events */
admSaveNews.addEventListener("click", ()=>{
  localStorage.setItem("newsContent", admNews.value);
  alert("Actualités sauvegardées");
  if(window.refreshSiteContent) window.refreshSiteContent();
});
admSaveEvents.addEventListener("click", ()=>{
  localStorage.setItem("eventsContent", admEvents.value);
  alert("Évènements sauvegardés");
  if(window.refreshSiteContent) window.refreshSiteContent();
});

/* gallery functions */
function renderGallery(){
  galleryList.innerHTML = "";
  const imgs = JSON.parse(localStorage.getItem("images") || "[]");
  imgs.forEach((b64,i)=>{
    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";
    wrapper.style.position = "relative";
    const img = document.createElement("img");
    img.src = b64;
    img.style.width = "100px";
    img.style.height = "70px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";
    const btn = document.createElement("button");
    btn.textContent = "🗑";
    btn.className = "small-btn";
    btn.style.position = "absolute";
    btn.style.right = "2px";
    btn.style.top = "2px";
    btn.addEventListener("click", ()=>{
      if(!confirm("Supprimer cette image ?")) return;
      imgs.splice(i,1);
      localStorage.setItem("images", JSON.stringify(imgs));
      renderGallery();
      if(window.refreshSiteContent) window.refreshSiteContent();
    });
    wrapper.appendChild(img);
    wrapper.appendChild(btn);
    galleryList.appendChild(wrapper);
  });
}

imgUploadBtn.addEventListener("click", ()=>{
  const file = imgFile.files[0];
  if(!file){ alert("Aucune image sélectionnée"); return; }
  const reader = new FileReader();
  reader.onload = function(e){
    const imgs = JSON.parse(localStorage.getItem("images") || "[]");
    imgs.unshift(e.target.result); // newest first
    localStorage.setItem("images", JSON.stringify(imgs));
    renderGallery();
    if(window.refreshSiteContent) window.refreshSiteContent();
  };
  reader.readAsDataURL(file);
});

/* vod admin */
function renderVodAdmin(){
  vodListAdmin.innerHTML = "";
  const vods = JSON.parse(localStorage.getItem("vods") || "[]");
  vods.forEach((v, i) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "8px";
    div.style.marginBottom = "6px";
    const title = document.createElement("span");
    title.textContent = v.title || v.url;
    const play = document.createElement("button");
    play.className = "small-btn";
    play.textContent = "▶";
    play.addEventListener("click", ()=>{
      // open modal with iframe preview
      const win = window.open("", "_blank");
      win.document.write(`<iframe src="${v.url}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`);
    });
    const del = document.createElement("button");
    del.className = "small-btn";
    del.textContent = "🗑";
    del.addEventListener("click", ()=>{
      if(!confirm("Supprimer cette VOD ?")) return;
      vods.splice(i,1);
      localStorage.setItem("vods", JSON.stringify(vods));
      renderVodAdmin();
      if(window.refreshSiteContent) window.refreshSiteContent();
    });
    div.appendChild(title);
    div.appendChild(play);
    div.appendChild(del);
    vodListAdmin.appendChild(div);
  });
}

addVodBtn.addEventListener("click", ()=>{
  const url = (vodInput.value || "").trim();
  const title = (vodTitleInput.value || "").trim();
  if(!url){ alert("Entrez une URL d'embed valide"); return; }
  const vods = JSON.parse(localStorage.getItem("vods") || "[]");
  vods.unshift({url, title});
  localStorage.setItem("vods", JSON.stringify(vods));
  vodInput.value = ""; vodTitleInput.value = "";
  renderVodAdmin();
  if(window.refreshSiteContent) window.refreshSiteContent();
});

/* initial render if already logged */
if(localStorage.getItem("adminLogged")==="1"){
  showAdminContent();
}

/* expose showAdminModal globally so main.js can call it */
window.showAdminModal = showAdminModal;
window.hideAdminModal = hideAdminModal;


