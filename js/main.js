document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".tab .tab-btn");
  const sections = document.querySelectorAll(".section");

  function activate(targetId){
    sections.forEach(s => s.classList.toggle("active", s.id === targetId));
    tabBtns.forEach(b => b.classList.toggle("active", b.dataset.target === targetId));
    window.scrollTo({top:0, behavior:"smooth"});
  }

  tabBtns.forEach(btn => btn.addEventListener("click", () => activate(btn.dataset.target)));

  // initial tab
  activate(tabBtns[0].dataset.target);

  // Admin button
  document.getElementById("openAdminBtn")?.addEventListener("click", () => {
    if(window.showAdminModal) window.showAdminModal();
  });

  // Load content
  loadStoredContent();
  renderVODs();
});

function loadStoredContent(){
  const news = localStorage.getItem("newsContent");
  if(news) document.getElementById("newsContent").innerHTML = news;

  const events = localStorage.getItem("eventsContent");
  if(events) document.getElementById("eventsContent").innerHTML = events;
}

function renderVODs(){
  const vods = JSON.parse(localStorage.getItem("vods") || "[]");
  const mainContainer = document.getElementById("vodContainer");
  const pageContainer = document.getElementById("vodContainerPage");

  [mainContainer, pageContainer].forEach(container => {
    if(!container) return;
    container.innerHTML = "";
    vods.forEach(v => {
      const iframe = document.createElement("iframe");
      iframe.src = v.url;
      iframe.width = "560";
      iframe.height = "315";
      iframe.setAttribute("title", v.title || "VOD");
      iframe.loading = "lazy";
      container.appendChild(iframe);
    });
  });
}
