/* admin.js - version corrigée (login + gallery + VOD) */
(() => {
  // CONFIG (change si besoin)
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "lemarquis12";

  // Root modal container (injecté dans index.html as #adminModal)
  const adminRoot = document.getElementById("adminModal");
  if (!adminRoot) {
    console.error("admin.js: #adminModal introuvable dans le DOM.");
    return;
  }

  // Build HTML only once (keeps IDs consistent with main.js)
  adminRoot.innerHTML = `
    <div class="admin-modal-bg hidden" id="adminBg"></div>
    <div class="admin-window hidden" id="adminWindow" role="dialog" aria-modal="true" aria-hidden="true">
      <button id="adminCloseTop" class="admin-close-btn">✖</button>
      <h2>Panneau d'administration</h2>

      <div id="loginSection">
        <input id="admUser" placeholder="Nom d'utilisateur" />
        <input id="admPass" type="password" placeholder="Mot de passe" />
        <div style="display:flex;gap:8px;margin-top:8px">
          <button id="admLoginBtn">Se connecter</button>
          <button id="admCloseBtn">Fermer</button>
        </div>
        <p id="admMsg" style="color:#f88;margin-top:8px"></p>
      </div>

      <div id="adminContent" class="hidden" style="margin-top:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>Admin connecté</strong>
          <div>
            <button id="admLogoutBtn" class="small-btn">Déconnexion</button>
          </div>
        </div>

        <hr style="margin:12px 0">

        <label><strong>Actualités</strong></label>
        <textarea id="admNews" rows="4" placeholder="Actualités..."></textarea>
        <button id="admSaveNews" class="admin-actions">Enregistrer Actualités</button>

        <label style="margin-top:8px"><strong>Évènements</strong></label>
        <textarea id="admEvents" rows="3" placeholder="Évènements..."></textarea>
        <button id="admSaveEvents" class="admin-actions">Enregistrer Évènements</button>

        <hr style="margin:12px 0">

        <label><strong>Galerie d'images</strong></label>
        <input id="imgFile" type="file" accept="image/*" />
        <button id="imgUploadBtn" class="admin-actions">Uploader image</button>
        <div id="galleryList" class="gallery" style="margin-top:8px"></div>

        <hr style="margin:12px 0">

        <label><strong>VOD (embed URL)</strong></label>
        <input id="vodInput" placeholder="URL embed (player.twitch.tv/?video=... ou youtube embed)" />
        <input id="vodTitle" placeholder="Titre (optionnel)" />
        <button id="addVodBtn" class="admin-actions">Ajouter VOD</button>
        <div id="vodListAdmin" style="margin-top:8px"></div>
      </div>
    </div>
  `;

  // Elements
  const adminBg = document.getElementById("adminBg");
  const adminWindow = document.getElementById("adminWindow");
  const adminCloseTop = document.getElementById("adminCloseTop");
  const admCloseBtn = document.getElementById("admCloseBtn");
  const admLoginBtn = document.getElementById("admLoginBtn");
  const admUser = document.getElementById("admUser");
  const admPass = document.getElementById("admPass");
  const admMsg = document.getElementById("admMsg");

  const adminContent = document.getElementById("adminContent");
  const admLogoutBtn = document.getElementById("admLogoutBtn");

  const admNews = document.getElementById("admNews");
  const admSaveNews = document.getElementById("admSaveNews");
  const admEvents = document.getElementById("admEvents");
  const admSaveEvents = document.getElementById("admSaveEvents");

  const imgFile = document.getElementById("imgFile");
  const imgUploadBtn = document.getElementById("imgUploadBtn");
  const galleryList = document.getElementById("galleryList");

  const vodInput = document.getElementById("vodInput");
  const vodTitle = document.getElementById("vodTitle");
  const addVodBtn = document.getElementById("addVodBtn");
  const vodListAdmin = document.getElementById("vodListAdmin");

  // Utility: show/hide modal
  function openModal() {
    adminRoot.classList.remove("hidden");
    adminBg.classList.remove("hidden");
    adminWindow.classList.remove("hidden");
    adminWindow.setAttribute("aria-hidden", "false");

    // if already logged in
    if (localStorage.getItem("adminLogged") === "1") {
      showAdminContent();
    } else {
      document.getElementById("loginSection").style.display = "block";
      adminContent.classList.add("hidden");
    }
  }
  function closeModal() {
    adminRoot.classList.add("hidden");
    adminBg.classList.add("hidden");
    adminWindow.classList.add("hidden");
    adminWindow.setAttribute("aria-hidden", "true");
  }

  // attach global opener if header button exists
  const openAdminBtn = document.getElementById("openAdminBtn") || document.querySelector(".admin-open-btn");
  if (openAdminBtn) openAdminBtn.addEventListener("click", openModal);

  // close handlers
  adminBg.addEventListener("click", closeModal);
  adminCloseTop.addEventListener("click", closeModal);
  admCloseBtn.addEventListener("click", closeModal);

  // login
  admLoginBtn.addEventListener("click", () => {
    const u = (admUser.value || "").trim();
    const p = (admPass.value || "").trim();
    if (!u || !p) {
      admMsg.textContent = "Remplis nom d'utilisateur et mot de passe.";
      return;
    }
    if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
      localStorage.setItem("adminLogged", "1");
      admMsg.textContent = "";
      showAdminContent();
      console.info("admin.js: connexion OK");
    } else {
      admMsg.textContent = "Identifiants incorrects.";
      console.warn("admin.js: tentative login échouée");
    }
  });

  // show admin content
  function showAdminContent() {
    document.getElementById("loginSection").style.display = "none";
    adminContent.classList.remove("hidden");

    // fill editors from storage
    admNews.value = localStorage.getItem("newsContent") || "";
    admEvents.value = localStorage.getItem("eventsContent") || "";
    renderGallery();
    renderVodAdmin();
  }

  // logout
  admLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminLogged");
    closeModal();
  });

  // save news/events
  admSaveNews.addEventListener("click", () => {
    localStorage.setItem("newsContent", admNews.value || "");
    if (window.refreshSiteContent) window.refreshSiteContent();
    alert("Actualités enregistrées.");
  });
  admSaveEvents.addEventListener("click", () => {
    localStorage.setItem("eventsContent", admEvents.value || "");
    if (window.refreshSiteContent) window.refreshSiteContent();
    alert("Évènements enregistrés.");
  });

  /* IMAGES (base64 in localStorage) */
  function renderGallery() {
    galleryList.innerHTML = "";
    const imgs = JSON.parse(localStorage.getItem("images") || "[]");
    imgs.forEach((b64, i) => {
      const wrap = document.createElement("div");
      wrap.style.position = "relative";
      wrap.style.display = "inline-block";
      wrap.style.marginRight = "8px";
      const img = document.createElement("img");
      img.src = b64;
      img.style.width = "100px";
      img.style.height = "70px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";
      const del = document.createElement("button");
      del.textContent = "🗑";
      del.className = "small-btn";
      del.style.position = "absolute";
      del.style.top = "4px";
      del.style.right = "4px";
      del.addEventListener("click", () => {
        if (!confirm("Supprimer cette image ?")) return;
        imgs.splice(i, 1);
        localStorage.setItem("images", JSON.stringify(imgs));
        renderGallery();
        if (window.refreshSiteContent) window.refreshSiteContent();
      });
      wrap.appendChild(img);
      wrap.appendChild(del);
      galleryList.appendChild(wrap);
    });
  }

  imgUploadBtn.addEventListener("click", () => {
    const file = imgFile.files[0];
    if (!file) {
      alert("Sélectionne une image d'abord.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgs = JSON.parse(localStorage.getItem("images") || "[]");
      imgs.unshift(e.target.result);
      localStorage.setItem("images", JSON.stringify(imgs));
      renderGallery();
      if (window.refreshSiteContent) window.refreshSiteContent();
      imgFile.value = "";
      alert("Image ajoutée.");
    };
    reader.readAsDataURL(file);
  });

  /* VOD admin */
  function renderVodAdmin() {
    vodListAdmin.innerHTML = "";
    const vods = JSON.parse(localStorage.getItem("vods") || "[]");
    vods.forEach((v, i) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "8px";
      row.style.marginBottom = "6px";
      const title = document.createElement("span");
      title.textContent = v.title || v.url;
      const preview = document.createElement("button");
      preview.className = "small-btn";
      preview.textContent = "▶";
      preview.addEventListener("click", () => {
        window.open("", "_blank").document.write(`<iframe src="${v.url}" width="100%" height="600" allowfullscreen></iframe>`);
      });
      const del = document.createElement("button");
      del.className = "small-btn";
      del.textContent = "🗑";
      del.addEventListener("click", () => {
        if (!confirm("Supprimer cette VOD ?")) return;
        vods.splice(i, 1);
        localStorage.setItem("vods", JSON.stringify(vods));
        renderVodAdmin();
        if (window.refreshSiteContent) window.refreshSiteContent();
      });
      row.appendChild(title);
      row.appendChild(preview);
      row.appendChild(del);
      vodListAdmin.appendChild(row);
    });
  }

  addVodBtn.addEventListener("click", () => {
    const url = (vodInput.value || "").trim();
    const title = (vodTitle.value || "").trim();
    if (!url) {
      alert("Colle une URL d'embed valide.");
      return;
    }
    const vods = JSON.parse(localStorage.getItem("vods") || "[]");
    vods.unshift({ url, title });
    localStorage.setItem("vods", JSON.stringify(vods));
    vodInput.value = "";
    vodTitle.value = "";
    renderVodAdmin();
    if (window.refreshSiteContent) window.refreshSiteContent();
    alert("VOD ajoutée.");
  });

  // initial show if already logged
  if (localStorage.getItem("adminLogged") === "1") {
    showAdminContent();
  }

  // expose showAdminModal to global
  window.showAdminModal = openModal;
  window.hideAdminModal = closeModal;
})();
