document.addEventListener("DOMContentLoaded", () => {
  // menu onglets avec scroll
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if(target) target.scrollIntoView({behavior:"smooth"});
      
      // style actif
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // logo = scroll top
  const homeBtn = document.getElementById("homeBtn");
  homeBtn?.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
});

