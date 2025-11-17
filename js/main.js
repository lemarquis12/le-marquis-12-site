/* main.js - gestion onglets, load content, affichage VOD/news/events */

document.addEventListener("DOMContentLoaded", () => {
  // --- onglets / nav
  const tabBtns = document.querySelectorAll(".tab .tab-btn");
  const sections = document.querySelectorAll(".section");

  function activate(targetId){
    sections.forEach(s => s.classList.toggle("active", s.id === targetId));
    tabBtns.forEach(b => b.classList.toggle("active", b.dataset.target === targetId));
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      activate(btn.dataset.target);
      // scroll top to show header
      window.scrollTo({top:0,behavior:"smooth"});
    });
  });

  // initial show first tab (stream)
  const first = document.querySelector(".tab .tab-btn")?.dataset.target || "stream";
  activate(first);

  // --- bouton admin (header)
  const openAdminBtn = document.getElementById("openAdminBtn");
  openAdminBtn?.addEventListener("click", () => {
    // open admin modal (admin.js exposes function showAdminModal)
    if (window.showAdminModal) window.showAdminModal();
  });

  // --- load stored content
  loadStoredContent();
  renderVODsOnPage();
});

/* charge news/events/images/vods depuis localStorage */
function loadStoredContent(){
  const news = localStorage.getItem("newsContent");
  if(news) document.getElementById("newsContent").innerHTML = news;

  const events = localStorage.getItem("eventsContent");
  if(events) document.getElementById("eventsContent").innerHTML = events;
}

/* affiche VODs (stockés manuellement via admin) dans 2 endroits */
function renderVODsOnPage(){
  const vods = JSON.parse(localStorage.getItem("vods") || "[]");
  const containerMain = document.getElementById("vodContainer");
  const containerPage = document.getElementById("vodContainerPage");
  [containerMain, containerPage].forEach(container => {
    if(!container) return;
    container.innerHTML = "";
    vods.forEach(v => {
      const ifr = document.createElement("iframe");
      ifr.src = v.url;
      ifr.setAttribute("title", v.title || "VOD");
      ifr.width = "560";
      ifr.height = "315";
      ifr.loading = "lazy";
      container.appendChild(ifr);
    });
  });
}

/* helper pour être sûr que admin peut rafraîchir l'affichage */
window.refreshSiteContent = function(){
  loadStoredContent();
  renderVODsOnPage();
};


