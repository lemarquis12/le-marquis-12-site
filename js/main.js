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


