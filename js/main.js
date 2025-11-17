/* ===== ADMIN ===== */
const adminUser = "le_marquis_12";
const adminPass = "monmotdepasse"; // change le mot de passe

window.onload = function() {
    const adminPanel = document.getElementById("adminPanel");
    const adminBtn = document.getElementById("adminBtn");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    document.getElementById("adminContent").style.display = "none";

    adminBtn.addEventListener("click", () => {
        adminPanel.style.display = "block";
    });

    logoutBtn.addEventListener("click", () => {
        adminPanel.style.display = "none";
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("adminContent").style.display = "none";
    });

    loginBtn.addEventListener("click", () => {
        const u = document.getElementById("username").value;
        const p = document.getElementById("password").value;
        const msg = document.getElementById("loginMessage");
        if(u === adminUser && p === adminPass){
            document.getElementById("loginSection").style.display = "none";
            document.getElementById("adminContent").style.display = "block";

            if(localStorage.getItem("newsContent"))
                document.getElementById("newsEditor").value = localStorage.getItem("newsContent");
            if(localStorage.getItem("eventsContent"))
                document.getElementById("eventsEditor").value = localStorage.getItem("eventsContent");
        } else {
            msg.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
        }
    });

    document.getElementById("saveNewsBtn").addEventListener("click", () => {
        const n = document.getElementById("newsEditor").value;
        localStorage.setItem("newsContent", n);
        document.getElementById("newsContent").innerHTML = n;
        alert("Actualités enregistrées !");
    });

    document.getElementById("saveEventsBtn").addEventListener("click", () => {
        const e = document.getElementById("eventsEditor").value;
        localStorage.setItem("eventsContent", e);
        document.getElementById("eventsContent").innerHTML = e;
        alert("Évènements enregistrés !");
    });
}

/* ===== SCROLL SECTIONS ===== */
function scrollToSection(sectionId){
    document.getElementById(sectionId).scrollIntoView({behavior:"smooth"});
}
