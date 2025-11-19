// Onglets
const tabBtns = document.querySelectorAll(".tab-btn");
const sections = document.querySelectorAll(".section");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.target).classList.add("active");

    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    window.scrollTo({top:0,behavior:"smooth"});
  });
});

// Header animation scroll
window.addEventListener('scroll',function(){
    const header=document.querySelector('.top-header');
    if(window.scrollY>50){header.classList.add('shrink');}
    else{header.classList.remove('shrink');}
});

// Logo clique = scroll top
document.getElementById('homeBtn').addEventListener('click', () => {
  window.scrollTo({top:0, behavior:'smooth'});
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
