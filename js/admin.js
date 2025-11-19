// ADMIN MODAL OPEN/CLOSE
const adminModal = document.getElementById('adminModal');
document.getElementById('openAdminBtn').addEventListener('click', () => {
  adminModal.classList.remove('hidden');
});
document.getElementById('closeAdminBtn').addEventListener('click', () => {
  adminModal.classList.add('hidden');
});

// ADMIN TABS
document.querySelectorAll('.admin-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.section;
    document.querySelectorAll('.admin-content').forEach(c=>c.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// LOCAL STORAGE NEWS & EVENTS
function saveNews(){
  const val = document.getElementById('newsEditor').value;
  localStorage.setItem('newsContent', val);
  document.getElementById('newsContent').innerHTML = val;
  alert('Actualités sauvegardées !');
}

function saveEvents(){
  const val = document.getElementById('eventsEditor').value;
  localStorage.setItem('eventsContent', val);
  document.getElementById('eventsContent').innerHTML = val;
  alert('Évènements sauvegardés !');
}

// SHOP ADMIN
function addShopItem(){
  const title = document.getElementById('shopTitle').value;
  const desc = document.getElementById('shopDesc').value;
  const price = document.getElementById('shopPrice').value;
  const img = document.getElementById('shopImg').value;
  if(!title || !desc || !price || !img) return alert("Remplis tous les champs !");

  let shop = JSON.parse(localStorage.getItem('shopItems') || "[]");
  shop.push({title, desc, price, img});
  localStorage.setItem('shopItems', JSON.stringify(shop));
  renderShop();
  document.getElementById('shopTitle').value='';
  document.getElementById('shopDesc').value='';
  document.getElementById('shopPrice').value='';
  document.getElementById('shopImg').value='';
}

// RENDER SHOP
function renderShop(){
  const shop = JSON.parse(localStorage.getItem('shopItems') || "[]");
  const container = document.getElementById('shopContainer');
  const preview = document.getElementById('shopPreview');
  container.innerHTML='';
  preview.innerHTML='';
  shop.forEach((item,index)=>{
    // page boutique
    const div = document.createElement('div');
    div.className='shop-item';
    div.innerHTML=`<img src="${item.img}" alt="${item.title}">
                     <h3>${item.title}</h3>
                     <p>${item.desc}</p>
                     <strong>${item.price} €</strong>`;
    container.appendChild(div);
    // preview admin
    const pre = document.createElement('div');
    pre.className='shop-preview-item';
    pre.innerHTML=`${item.title} <button onclick="deleteShopItem(${index})">🗑️</button>`;
    preview.appendChild(pre);
  });
}

// DELETE SHOP ITEM
function deleteShopItem(index){
  let shop = JSON.parse(localStorage.getItem('shopItems') || "[]");
  shop.splice(index,1);
  localStorage.setItem('shopItems', JSON.stringify(shop));
  renderShop();
}

// LOAD DATA ON START
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('newsEditor').value = localStorage.getItem('newsContent') || '';
  document.getElementById('newsContent').innerHTML = localStorage.getItem('newsContent') || '';
  document.getElementById('eventsEditor').value = localStorage.getItem('eventsContent') || '';
  document.getElementById('eventsContent').innerHTML = localStorage.getItem('eventsContent') || '';
  renderShop();
});
