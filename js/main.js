// Tabs
function openTab(evt, tabName){
    var i, tabcontent, tablinks;
    tabcontent=document.getElementsByClassName("tabcontent");
    for(i=0;i<tabcontent.length;i++){tabcontent[i].style.display="none";}
    tablinks=document.getElementsByClassName("tablinks");
    for(i=0;i<tablinks.length;i++){tablinks[i].className=tablinks[i].className.replace(" active","");}
    document.getElementById(tabName).style.display="block";
    evt.currentTarget.className+=" active";
}

// Header scroll
window.addEventListener('scroll',function(){
    const header=document.querySelector('.top-header');
    if(window.scrollY>50){header.classList.add('shrink');}
    else{header.classList.remove('shrink');}
});
<div id="stream" class="tabcontent" style="display:block;">
  <h2>Live Twitch & Chat</h2>
  <div id="streamChatContainer">
   <script src= "https://player.twitch.tv/js/embed/v1.js"></script>
<div id="<player div ID>"></div>
<script type="text/javascript">
// LOGIN ADMIN
function loginAdmin(){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    if(username === 'admin' && password === '1234'){
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        loadData();
    } else {
        loginMessage.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
        loginMessage.style.color = 'red';
    }
}

// LOGOUT
function logout(){
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
}

// AFFICHER LES SECTIONS
function showSection(sectionId){
    const sections = document.getElementsByClassName('adminSection');
    for(let i=0; i<sections.length; i++){
        sections[i].style.display = 'none';
    }
    document.getElementById(sectionId).style.display = 'block';
}

// LOCAL STORAGE - SAUVEGARDER
function saveNews(){
    const news = document.getElementById('newsEditor').value;
    localStorage.setItem('newsContent', news);
    alert('Actualités sauvegardées !');
}

function saveEvents(){
    const events = document.getElementById('eventsEditor').value;
    localStorage.setItem('eventsContent', events);
    alert('Évènements sauvegardés !');
}

// LOCAL STORAGE - CHARGER
function loadData(){
    const news = localStorage.getItem('newsContent');
    const events = localStorage.getItem('eventsContent');
    if(news) document.getElementById('newsEditor').value = news;
    if(events) document.getElementById('eventsEditor').value = events;
}

