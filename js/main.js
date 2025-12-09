<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Communauté - le_marquis_12</title>
<link rel="stylesheet" href="css/style.css">
<link rel="icon" href="image/icon_TacticalBoy.png">
</head>
<body>

<header class="top-header animated-header" id="mainHeader">
    <img src="image/icon_TacticalBoy.png" alt="Logo" class="logo" id="homeBtn">
    <h1 class="site-title">Communauté du marquis 12</h1>
</header>

<div class="tab">
  <button class="tablinks active" data-target="stream">Live</button>
  <button class="tablinks" data-target="news">Actualités</button>
  <button class="tablinks" data-target="events">Évènements</button>
  <button class="tablinks" data-target="boutique">Boutique</button>
  <button class="tablinks" data-target="socials">Réseaux</button>
</div>

<main id="mainContent">
  <!-- STREAM -->
  <section id="stream" class="tabcontent" style="display:block;">
    <h2>Live Twitch & Chat</h2>
    <div id="streamChatContainer">
      <iframe src="https://player.twitch.tv/?channel=lemarquis12&parent=lemarquis12.github.io" allowfullscreen></iframe>
      <iframe src="https://www.twitch.tv/embed/lemarquis12/chat?parent=lemarquis12.github.io"></iframe>
    </div>
  </section>

  <!-- NEWS -->
  <section id="news" class="tabcontent">
    <h2>Actualités</h2>
    <div id="newsContent">Pas encore d'actualités disponibles.</div>
  </section>

  <!-- EVENTS -->
  <section id="events" class="tabcontent">
    <h2>Évènements</h2>
    <div id="eventsContent">Pas encore d'évènements programmés.</div>
  </section>

  <!-- SHOP -->
  <section id="boutique" class="tabcontent">
    <h2>Boutique</h2>
    <div id="shopContainer" class="shop-container"></div>
  </section>

  <!-- SOCIALS -->
  <section id="socials" class="tabcontent">
    <h2>Réseaux Sociaux 🌐</h2>
    <div class="social-card">
      <h3>🎮 Twitch — le_marquis_12</h3>
      <p>Bienvenue dans <b>le seul stream où le skill est en option</b>, mais la bonne ambiance obligatoire.<br>
      Ici, le Marquis mène des missions tactiques… souvent en <b>catastrophe contrôlée</b>.<br>
      🔥 Viens rire et spammer le chat.</p>
      <a class="social-btn" href="https://twitch.tv/lemarquis12" target="_blank">Accéder à Twitch</a>
    </div>
    <div class="social-card">
      <h3>▶️ YouTube — le_marquis_12</h3>
      <p>Revois :<br>✔️ Les meilleurs moments<br>✔️ Les pires fails<br>✔️ Les clips que même le Marquis voudrait oublier.<br>🎬 Bref, tout ce qui fait d’un stream une épopée (ou un accident).</p>
      <a class="social-btn" href="https://youtube.com/@le_marquis_12" target="_blank">Accéder à YouTube</a>
    </div>
    <div class="social-card">
      <h3>🎵 TikTok — @le_marquis_124</h3>
      <p>Clips courts, rapides, et dangereux pour ta santé mentale.<br>⚡ Explosion de chaos en 10 secondes.</p>
      <a class="social-btn" href="https://tiktok.com/@le_marquis_124" target="_blank">Accéder à TikTok</a>
    </div>
    <div class="social-card">
      <h3>📷 Instagram — @le_marquis12</h3>
      <p>QG officiel du Marquis en version stylée.<br>Photos, annonces, coulisses et parfois…<b>des posts à 3h du matin</b>.</p>
      <a class="social-btn" href="https://instagram.com/le_marquis12" target="_blank">Accéder à Instagram</a>
    </div>
    <div class="social-card">
      <h3>💬 Discord — Communauté</h3>
      <p>Le chat officiel où tu peux discuter avec les fans.<br>🎉 Memes, conseils, et rage quit inclus.</p>
      <a class="social-btn" href="https://discord.gg/tonlien" target="_blank">Accéder à Discord</a>
    </div>
  </section>
</main>

<footer class="footer">
    <p>© 2025 - Communauté du marquis 12</p>
</footer>

<!-- PANEL ADMIN LOCAL -->
<div id="adminModal" class="admin-modal hidden">
  <div class="admin-window">
    <button class="admin-close-btn" id="closeAdminBtn">✖</button>
    
    <div id="loginSection">
      <h3>Admin Login</h3>
      <input id="username" type="text" placeholder="Nom d'utilisateur">
      <input id="password" type="password" placeholder="Mot de passe">
      <button onclick="loginAdmin()">Se connecter</button>
      <p id="loginMessage" style="color:red"></p>
    </div>

    <div id="adminPanel" class="hidden">
      <button onclick="logout()">Se déconnecter</button>
      <div class="admin-tabs">
        <button onclick="showSection('adminNews')">Actualités</button>
        <button onclick="showSection('adminEvents')">Évènements</button>
        <button onclick="showSection('adminShop')">Boutique</button>
      </div>

      <div id="adminNews" class="adminSection">
        <textarea id="newsEditor" placeholder="Écris les actualités ici..."></textarea>
        <button onclick="saveNews()">💾 Sauvegarder Actualités</button>
      </div>

      <div id="adminEvents" class="adminSection hidden">
        <textarea id="eventsEditor" placeholder="Écris les évènements ici..."></textarea>
        <button onclick="saveEvents()">💾 Sauvegarder Évènements</button>
      </div>

      <div id="adminShop" class="adminSection hidden">
        <input type="text" id="shopTitle" placeholder="Nom de l'article">
        <input type="text" id="shopDesc" placeholder="Description">
        <input type="number" id="shopPrice" placeholder="Prix">
        <input type="text" id="shopImg" placeholder="URL image">
        <button onclick="addShopItem()">➕ Ajouter Article</button>
        <h4>Articles existants :</h4>
        <div id="shopPreview"></div>
      </div>
    </div>
  </div>
</div>

<script src="js/main.js"></script>
<script src="js/admin.js"></script>
</body>
</html>
