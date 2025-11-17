/* Onglets */
function openTab(evt, tabName){
  const tabcontent=document.querySelectorAll(".tabcontent");
  tabcontent.forEach(tc=>tc.style.display="none");
  const tablinks=document.querySelectorAll(".tab button");
  tablinks.forEach(t=>t.classList.remove("active"));
  document.getElementById(tabName).style.display="block";
  evt.currentTarget.classList.add("active");
}
document.querySelector(".tab button.active").click();

/* Retour accueil */
function goHome(){
  document.querySelector(".tab button.active").click();
}

/* Charger contenu depuis admin (LocalStorage) */
function loadContent(){
  const news=localStorage.getItem("newsContent");
  if(news) document.getElementById("newsContent").innerHTML=news;
  const events=localStorage.getItem("eventsContent");
  if(events) document.getElementById("eventsContent").innerHTML=events;
  const vods=JSON.parse(localStorage.getItem("vods")||"[]");
  const vodContainer=document.getElementById("vodContainer");
  vodContainer.innerHTML="";
  vods.forEach(v=>{
      const iframe=document.createElement("iframe");
      iframe.src=v.url;
      iframe.width="600";
      iframe.height="340";
      iframe.allowFullscreen=true;
      vodContainer.appendChild(iframe);
  });
}
loadContent();
