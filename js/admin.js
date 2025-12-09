// ==== ADMIN LOCAL PANEL ====
const adminModal = document.getElementById("adminModal");
const loginSection = document.getElementById("loginSection");
const adminPanel = document.getElementById("adminPanel");
const loginMessage = document.getElementById("loginMessage");

// ==== OPEN ADMIN VIA CTRL + A ====
document.addEventListener("keydown", e => {
    if(e.ctrlKey && e.key.toLowerCase() === "a"){
        adminModal.classList.remove("hidden");
        loginSection.style.display = "block";
        adminPanel.classList.add("hidden");
    }
});

// ==== CLOSE ADMIN ====
document.getElementById("closeAdminBtn").addEventListener("click", () => {
    adminModal.classList.add("hidden");
});

// ==== LOGIN ====
function loginAdmin(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if(username === "admin" && password === "1234"){
        loginSection.style.display = "none";
        adminPanel.classList.remove("hidden");
        loadData();
    } else {
        loginMessage.innerText = "Nom d'utilisateur ou mot de passe incorrect";
    }
}

// ==== LOGOUT ====
function logout(){
    loginSection.style.display = "block";
    adminPanel.classList.add("hidden");
}

// ==== SHOW ADMIN SECTIONS ====
function showSection(sectionId){
    const sections = document.querySelectorAll(".adminSection");
    sections.forEach(s => s.classList.add("hidden"));
    document.getElementById(sectionId).classList.remove("hidden");
}

// ==== LOCAL STORAGE ====
// News
function saveNews(){
    const news = document.getElementById("newsEditor").value;
    localStorage.setItem("newsContent", news);
    loadData(); // refresh
    alert("Actualités sauvegardées !");
}
// Events
function saveEvents(){
    const events = document.getElementById("eventsEditor").value;
    localStorage.setItem("eventsContent", events);
    loadData();
    alert("Évènements sauvegardés !");
}

// Shop
function addShopItem(){
    const title = document.getElementById("shopTitle").value;
    const desc = document.getElementById("shopDesc").value;
    const price = document.getElementById("shopPrice").value;
    const img = document.getElementById("shopImg").value;

    if(!title || !desc || !price) return alert("Remplis tous les champs !");

    let shopItems = JSON.parse(localStorage.getItem("shopItems")) || [];
    shopItems.push({title, desc, price, img});
    localStorage.setItem("shopItems", JSON.stringify(shopItems));
    document.getElementById("shopTitle").value = "";
    document.getElementById("shopDesc").value = "";
    document.getElementById("shopPrice").value = "";
    document.getElementById("shopImg").value = "";
    loadShop();
}

// ==== LOAD DATA ====
function loadData(){
    // News
    const news = localStorage.getItem("newsContent");
    if(news) document.getElementById("newsContent").innerHTML = news;
    document.getElementById("newsEditor").value = news || "";

    // Events
    const events = localStorage.getItem("eventsContent");
    if(events) document.getElementById("eventsContent").innerHTML = events;
    document.getElementById("eventsEditor").value = events || "";

    // Shop
    loadShop();
}

// ==== LOAD SHOP ====
function loadShop(){
    const container = document.getElementById("shopContainer");
    const preview = document.getElementById("shopPreview");
    let shopItems = JSON.parse(localStorage.getItem("shopItems")) || [];

    container.innerHTML = "";
    preview.innerHTML = "";

    shopItems.forEach((item, i) => {
        // Frontend display
        const div = document.createElement("div");
        div.className = "shop-item";
        div.innerHTML = `
            ${item.img ? `<img src="${item.img}" alt="${item.title}">` : ""}
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
            <b>${item.price} €</b>
        `;
        container.appendChild(div);

        // Admin preview
        const pre = document.createElement("div");
        pre.innerHTML = `${item.title} - ${item.price}€ <button onclick="deleteShopItem(${i})">Supprimer</button>`;
        preview.appendChild(pre);
    });
}

// ==== DELETE SHOP ITEM ====
function deleteShopItem(index){
    let shopItems = JSON.parse(localStorage.getItem("shopItems")) || [];
    shopItems.splice(index, 1);
    localStorage.setItem("shopItems", JSON.stringify(shopItems));
    loadShop();
}
