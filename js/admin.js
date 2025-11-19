// Sauvegarde dans localStorage
function saveNews(){
  const news = document.getElementById('newsEditor').value;
  localStorage.setItem('newsContent', news);
  document.getElementById('newsContent').innerHTML = news;
  alert("Actualités sauvegardées !");
}

function saveEvents(){
  const events = document.getElementById('eventsEditor').value;
  localStorage.setItem('eventsContent', events);
  document.getElementById('eventsContent').innerHTML = events;
  alert("Évènements sauvegardés !");
}

// Charger données au démarrage
document.addEventListener("DOMContentLoaded", () => {
  const news = localStorage.getItem('newsContent');
  const events = localStorage.getItem('eventsContent');
  if(news) document.getElementById('newsContent').innerHTML = news;
  if(events) document.getElementById('eventsContent').innerHTML = events;
});

