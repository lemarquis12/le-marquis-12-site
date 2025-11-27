// main.js - tabs, header, chat toggle, theatre, product modal, load content
document.addEventListener('DOMContentLoaded', () => {
  // TABS
  const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
  const tabContents = Array.from(document.querySelectorAll('.tabcontent'));

  function showTab(name){
    tabContents.forEach(c => c.style.display = (c.id === name) ? 'block' : 'none');
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.target === name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  tabBtns.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.target)));
  showTab('stream');

  // HEADER shrink
  const header = document.querySelector('.top-header');
  window.addEventListener('scroll', () => header.classList.toggle('shrink', window.scrollY > 50));

  // logo = stream
  document.getElementById('homeBtn')?.addEventListener('click', () => showTab('stream'));

  // CHAT TOGGLE
  const toggleChatBtn = document.getElementById('toggleChatBtn');
  const twitchChat = document.getElementById('twitchChat');
  let chatHidden = false;
  toggleChatBtn?.addEventListener('click', () => {
    chatHidden = !chatHidden;
    if(chatHidden){
      twitchChat.style.display = 'none';
      toggleChatBtn.textContent = 'Afficher chat';
    } else {
      twitchChat.style.display = 'block';
      toggleChatBtn.textContent = 'Masquer chat';
    }
  });

  // THEATRE MODE (expand player)
  const theaterBtn = document.getElementById('theaterBtn');
  const player = document.getElementById('twitchPlayer');
  let theatre = false;
  theaterBtn?.addEventListener('click', () => {
    theatre = !theatre;
    if(theatre){
      player.style.width = '100%';
      player.style.maxWidth = '1200px';
      player.style.height = '720px';
      document.getElementById('streamChatContainer').style.justifyContent = 'center';
      theaterBtn.textContent = 'Quitter théâtre';
    } else {
      player.style.width = '700px';
      player.style.height = '400px';
      theaterBtn.textContent = 'Mode théâtre';
      document.getElementById('streamChatContainer').style.justifyContent = '';
    }
    // for small screens, auto revert
    if(window.innerWidth < 920){
      player.style.width = '100%';
      player.style.height = '420px';
    }
  });

  // PRODUCT MODAL
  const productModal = document.getElementById('productModal');
  const closeProductModal = document.getElementById('closeProductModal');
  closeProductModal?.addEventListener('click', () => productModal.classList.add('hidden'));

  // click on shop items (delegation)
  document.getElementById('shopContainer')?.addEventListener('click', (e) => {
    const item = e.target.closest('.shop-item');
    if(!item) return;
    const idx = item.dataset.idx;
    const shop = JSON.parse(localStorage.getItem('shopItems') || '[]');
    const it = shop[parseInt(idx)];
    if(!it) return;
    document.getElementById('productModalImg').src = it.img;
    document.getElementById('productModalTitle').textContent = it.title;
    document.getElementById('productModalDesc').textContent = it.desc;
    document.getElementById('productModalPrice').textContent = it.price + ' €';
    productModal.classList.remove('hidden');
  });

  // initial load content
  refreshSiteContent();
});

// refreshSiteContent used by admin after saves
function refreshSiteContent(){
  const news = localStorage.getItem('newsContent');
  const events = localStorage.getItem('eventsContent');
  const shop = JSON.parse(localStorage.getItem('shopItems') || '[]');

  if(news) document.getElementById('newsContent').innerHTML = news;
  if(events) document.getElementById('eventsContent').innerHTML = events;

  // render shop
  const container = document.getElementById('shopContainer');
  container.innerHTML = '';
  shop.forEach((it, idx) => {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.dataset.idx = idx;
    div.innerHTML = `
      <img src="${it.img}" alt="${escapeHtml(it.title)}">
      <h3>${escapeHtml(it.title)}</h3>
      <p>${escapeHtml(it.desc)}</p>
      <strong>${escapeHtml(it.price)} €</strong>
    `;
    container.appendChild(div);
  });
}

// small helper
function escapeHtml(str){
  if(!str) return '';
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

let lastScrollPos = window.scrollY;
const header = document.querySelector("header");
let headerHidden = false;

window.addEventListener("scroll", () => {
    const currentPos = window.scrollY;

    // Scroll vers le bas → cacher le header
    if (currentPos > lastScrollPos && currentPos > 50) {
        if (!headerHidden) {
            header.classList.add("header-hidden");
            headerHidden = true;
        }
    }

    // Scroll vers le haut → montrer le header
    else {
        if (headerHidden) {
            header.classList.remove("header-hidden");
            headerHidden = false;
        }
    }

    lastScrollPos = currentPos;
});

