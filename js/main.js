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

// Logo: back to Live tab
document.addEventListener('DOMContentLoaded', function(){
  const logo = document.querySelector('.top-header .logo');
  const firstTab = document.querySelector('.tab .tablinks');
  if(logo && firstTab){
    logo.addEventListener('click', function(){
      firstTab.click();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }

  // set default visible
  var active = document.querySelector('.tab .active');
  if(!active) document.querySelector('.tab .tablinks').classList.add('active');
  // ensure stream visible on load
  var stream = document.getElementById('stream');
  if(stream) stream.style.display = 'block';
});

// LOCAL STORAGE CONTENT LOAD
function refreshSiteContent(){
  const news = localStorage.getItem('newsContent');
  const events = localStorage.getItem('eventsContent');
  const shop = localStorage.getItem('shopContent');
  const logoURL = localStorage.getItem('logoURL');

  if(news) document.getElementById('newsContent').innerHTML = news;
  if(events) document.getElementById('eventsContent').innerHTML = events;
  if(shop) document.getElementById('boutiqueContent').innerHTML = shop;
  if(logoURL) {
    const logo = document.querySelector('.top-header .logo');
    if(logo) logo.src = logoURL;
  }

  // socials links
  const lt = localStorage.getItem('linkTwitch');
  const ly = localStorage.getItem('linkYoutube');
  const lti = localStorage.getItem('linkTiktok');
  const li = localStorage.getItem('linkInsta');
  if(lt) document.getElementById('linkTwitch').href = lt;
  if(ly) document.getElementById('linkYoutube').href = ly;
  if(lti) document.getElementById('linkTiktok').href = lti;
  if(li) document.getElementById('linkInsta').href = li;
}

// initial refresh once DOM loaded
document.addEventListener('DOMContentLoaded', refreshSiteContent);
