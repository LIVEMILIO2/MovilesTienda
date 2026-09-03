// SDK de Firebase para web, version modular (se importa directo desde
// internet, no hace falta instalar nada con npm)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const statusText = document.getElementById('status-text');
const grid = document.getElementById('skins-grid');

// mismo nodo "skins" que usamos en Unity: cada hijo tiene name, price y spriteName
const skinsRef = ref(db, 'skins');

onValue(skinsRef, (snapshot) => {
  const data = snapshot.val() || {};
  renderSkins(data);
}, (error) => {
  statusText.textContent = 'Error leyendo la tienda: ' + error.message;
});

function renderSkins(skinsData) {
  const entries = Object.entries(skinsData);
  statusText.textContent = entries.length + ' skins disponibles';

  grid.innerHTML = '';

  entries.forEach(([id, skin]) => {
    const card = document.createElement('div');
    card.className = 'skin-card';
    card.innerHTML = `
      <img src="images/${skin.img}.png">
      <h3>${skin.name}</h3>
      <p>${skin.price} monedas</p>
    `;
    grid.appendChild(card);
  });
}

// registra el service worker para que la app cargue rapido y funcione offline.
// esto solo funciona sirviendo la pagina por http/https, no abriendo el
// archivo index.html directo desde el explorador de archivos.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('Service worker registrado'))
      .catch((err) => console.error('Error registrando el service worker:', err));
  });
}
