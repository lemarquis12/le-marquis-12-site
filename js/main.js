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
      window.scrollTo({top:0,behavior:"smooth"});
    });
  });

  // initial show first tab (stream)
  const first = document.querySelector(".tab .tab-btn")?.dataset.target || "stream";
  activate(first);

  // --- bouton admin
  const openAdminBtn = document.getElementById("openAdminBtn");
  openAdminBtn?.addEventListener("click", () => {
    if(window.showAdminModal) window.showAdminModal();
  });

  // load stored content (news/events)
  loadStoredContent();
});

function loadStoredContent(){
  const news = localStorage.getItem("newsContent");
  if(news) document.getElementById("newsContent").innerHTML = news;

  const events = localStorage.getItem("eventsContent");
  if(events) document.getElementById("eventsContent").innerHTML = events;
}
