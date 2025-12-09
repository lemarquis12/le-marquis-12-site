// ==== TABS ====
const tabButtons = document.querySelectorAll(".tablinks");
const tabContents = document.querySelectorAll(".tabcontent");

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.style.display = "none");

        const target = btn.getAttribute("data-target");
        document.getElementById(target).style.display = "block";
        btn.classList.add("active");
    });
});

// ==== HEADER SCROLL (mobile + desktop) ====
let lastScrollY = window.scrollY;
const header = document.getElementById("mainHeader");

window.addEventListener("scroll", () => {
    if(window.scrollY > lastScrollY){
        header.style.transform = "translateY(-100%)"; // scroll down → hide
    } else {
        header.style.transform = "translateY(0)"; // scroll up → show
    }
    lastScrollY = window.scrollY;
});
header.style.transition = "transform 0.25s ease";

// ==== STREAM CHAT ADJUST ====
const streamChat = document.querySelectorAll("#streamChatContainer iframe");
streamChat.forEach(f => {
    f.style.width = "100%";
    f.style.maxWidth = "500px"; // limite la taille pour mobile
    f.style.height = "400px";
});
