document.addEventListener("DOMContentLoaded",()=>{
  const tabBtns = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".section");

  function showSection(id){
    sections.forEach(sec=>sec.classList.toggle("active",sec.id===id));
    tabBtns.forEach(btn=>btn.classList.toggle("active",btn.dataset.target===id));
    window.scrollTo({top:0,behavior:"smooth"});
  }

  tabBtns.forEach(btn=>btn.addEventListener("click",()=>showSection(btn.dataset.target)));

  // logo = retour au premier onglet
  document.getElementById("homeBtn")?.addEventListener("click",()=>showSection(tabBtns[0].dataset.target));

  // afficher la première section
  showSection(tabBtns[0].dataset.target);
});
