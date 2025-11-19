// ==== TABS ====
const tabLinks = document.querySelectorAll('.tablinks');
const tabContents = document.querySelectorAll('.tabcontent');

tabLinks.forEach(link => {
  link.addEventListener('click', () => {
    const target = link.dataset.target;
    // masquer toutes les sections
    tabContents.forEach(sec => sec.style.display = 'none');
    // retirer active à tous les boutons
    tabLinks.forEach(btn => btn.classList.remove('active'));
    // afficher la section cible et bouton actif
    document.getElementById(target).style.display = 'block';
    link.classList.add('active');
    // scroll top pour voir header
    window.scrollTo({top:0, behavior:'smooth'});
  });
});

// ==== HEADER SCROLL ====
window.addEventListener('scroll', () => {
  const header = document.querySelector('.top-header');
  if(window.scrollY > 50){
    header.classList.add('shrink');
  } else {
    header.classList.remove('shrink');
  }
});

// ==== HOME BUTTON ====
const homeBtn = document.getElementById('homeBtn');
homeBtn.addEventListener('click', () => {
  tabContents.forEach(sec => sec.style.display = 'block');
  tabLinks.forEach(btn => btn.classList.remove('active'));
});


// Admin modal
const openAdminBtn = document.getElementById("openAdminBtn");
const closeAdminBtn = document.getElementById("closeAdminBtn");
const adminModal = document.getElementById("adminModal");

openAdminBtn.addEventListener("click", () => {
  adminModal.classList.remove("hidden");
});

closeAdminBtn.addEventListener("click", () => {
  adminModal.classList.add("hidden");
});

