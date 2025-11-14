const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

function loginAdmin(){
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const msg = document.getElementById("loginMessage");
  if(user === ADMIN_USER && pass === ADMIN_PASS){
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminPanel").style.display = "flex";
    document.getElementById("newsEditor").value = localStorage.getItem("newsContent")||"Bienvenue sur les actualités !";
    document.getElementById("eventsEditor").value = localStorage.getItem("eventsContent")||"Aucun évènement pour le moment.";
  } else { msg.textContent = "Nom d'utilisateur ou mot de passe incorrect."; msg.style.color="red";}
}

function saveNews(){
  const news = document.getElementById("newsEditor").value;
  localStorage.setItem("newsContent", news);
  alert("Actualités enregistrées !");
}

function saveEvents(){
  const events = document.getElementById("eventsEditor").value;
  localStorage.setItem("eventsContent", events);
  alert("Évènements enregistrés !");
}

function showSection(id){
  document.querySelectorAll(".adminSection").forEach(sec => sec.style.display="none");
  const el = document.getElementById(id); if(el) el.style.display="block";
}

function logout(){
  document.getElementById("adminPanel").style.display="none";
  document.getElementById("loginSection").style.display="block";
}
