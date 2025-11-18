document.addEventListener("DOMContentLoaded", () => {
  const tabBtns = document.querySelectorAll(".tab-btn");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const targetSection = document.getElementById(targetId);
      if(targetSection){
        // scroll vers la section
        targetSection.scrollIntoView({behavior:"smooth", block:"start"});
      }

      // ajouter le style actif
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // logo = retour en haut
  const homeBtn = document.getElementById("homeBtn");
  homeBtn?.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
});

