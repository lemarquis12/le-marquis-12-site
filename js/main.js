document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".section");

  function showSection(targetId) {
    sections.forEach(sec => sec.style.display = (sec.id===targetId)?"block":"none");
    tabBtns.forEach(btn => btn.classList.toggle("active", btn.dataset.target===targetId));
    window.scrollTo({top:0,behavior:"smooth"});
  }

  tabBtns.forEach(btn => btn.addEventListener("click", ()=>showSection(btn.dataset.target)));

  // afficher première section par défaut
  showSection(tabBtns[0].dataset.target);

  // logo retourne à la première section
  document.getElementById("homeBtn")?.addEventListener("click", ()=>showSection(tabBtns[0].dataset.target));

  // admin
  const openAdminBtn = document.getElementById("openAdminBtn");
  openAdminBtn?.addEventListener("click", ()=>{ if(window.showAdminModal) window.showAdminModal(); });
});


