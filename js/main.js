/* ===== ONGLETS ===== */
function openTab(evt, tabName){
    document.querySelectorAll(".tabcontent").forEach(tc=>tc.style.display="none");
    document.querySelectorAll(".tablinks").forEach(t=>t.classList.remove("active"));
    document.getElementById(tabName).style.display="block";
    evt.currentTarget.classList.add("active");
}
document.addEventListener("DOMContentLoaded",()=>{document.querySelector(".tablinks.active").click();});

/* ===== ADMIN ===== */
const adminUser="le_marquis_12";
const adminPass="monmotdepasse"; // change le mot de passe

function openAdminPanel(){document.getElementById("adminPanel").style.display="block";}
function loginAdmin(){
    const u=document.getElementById("username").value;
    const p=document.getElementById("password").value;
    const msg=document.getElementById("loginMessage");
    if(u===adminUser && p===adminPass){
        document.getElementById("loginSection").style.display="none";
        document.getElementById("adminContent").style.display="block";
        if(localStorage.getItem("newsContent"))document.getElementById("newsEditor").value=localStorage.getItem("newsContent");
        if(localStorage.getItem("eventsContent"))document.getElementById("eventsEditor").value=localStorage.getItem("eventsContent");
    } else {msg.textContent="Nom d'utilisateur ou mot de passe incorrect.";}
}
function logout(){document.getElementById("adminPanel").style.display="none";document.getElementById("loginSection").style.display="block";document.getElementById("adminContent").style.display="none";}
function saveNews(){const n=document.getElementById("newsEditor").value;localStorage.setItem("newsContent",n);document.getElementById("newsContent").innerHTML=n;alert("Actualités enregistrées !");}
function saveEvents(){const e=document.getElementById("eventsEditor").value;localStorage.setItem("eventsContent",e);document.getElementById("eventsContent").innerHTML=e;alert("Évènements enregistrés !");}
document.addEventListener("DOMContentLoaded",()=>{
    if(localStorage.getItem("newsContent"))document.getElementById("newsContent").innerHTML=localStorage.getItem("newsContent");
    if(localStorage.getItem("eventsContent"))document.getElementById("eventsContent").innerHTML=localStorage.getItem("eventsContent");
});
