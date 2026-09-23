// SDK de Firebase para web, version modular (se importa directo desde
// internet, no hace falta instalar nada con npm)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue, get, set, runTransaction } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const statusText = document.getElementById('status-text');
const grid = document.getElementById('skins-grid');
const compradosGrid = document.getElementById('comprados-grid');
const userGreeting = document.getElementById('user-greeting');
const logoutBtn = document.getElementById('logout-btn');
const coinsText = document.getElementById('coins-text');
const storeTabs = document.getElementById('store-tabs');

let currentUid = null;
let currentSkins = {};        // { id: {name, price, img, rarity} }, mismo formato que en Unity
let purchasedIds = new Set(); // ids que el usuario ya compro
let currentCoins = 0;

// Exige sesion iniciada: si no hay usuario, manda a login.html.
// Si la hay, recien ahi conectamos con la base de datos.
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUid = user.uid;

  userGreeting.textContent = 'AGENTE: ' + (user.displayName || user.email);
  userGreeting.style.display = 'block';
  logoutBtn.style.display = 'inline-block';
  coinsText.style.display = 'inline-block';
  storeTabs.style.display = 'flex';

  cargarSkins();
  cargarMonedas();
  cargarComprados();
});

logoutBtn.addEventListener('click', () => {
  signOut(auth);
});

// --- Pestañas Tienda / Comprados ---
storeTabs.querySelectorAll('.store-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    storeTabs.querySelectorAll('.store-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    const view = tab.dataset.view;
    grid.classList.toggle('active', view === 'tienda');
    compradosGrid.classList.toggle('active', view === 'comprados');
  });
});

// --- Skins disponibles (mismo nodo "skins" que usamos en Unity) ---
function cargarSkins() {
  const skinsRef = ref(db, 'skins');

  onValue(skinsRef, (snapshot) => {
    currentSkins = snapshot.val() || {};
    statusText.textContent = Object.keys(currentSkins).length + ' skins disponibles';
    renderTienda();
    renderComprados();
  }, (error) => {
    statusText.textContent = 'Error leyendo la tienda: ' + error.message;
  });
}

// --- Monedas del usuario (users/{uid}/coins) ---
function cargarMonedas() {
  const coinsRef = ref(db, 'users/' + currentUid + '/coins');

  // si el usuario es nuevo y no tiene el nodo todavia, arranca con 1000
  // (mismo valor por default que usa StoreManager.cs en Unity)
  get(coinsRef).then((snapshot) => {
    if (!snapshot.exists()) {
      set(coinsRef, 1000);
    }
  });

  onValue(coinsRef, (snapshot) => {
    currentCoins = snapshot.val() || 0;
    coinsText.textContent = currentCoins + ' monedas';
    renderTienda();
  });
}

// --- Compras del usuario (users/{uid}/purchased) ---
function cargarComprados() {
  const purchasedRef = ref(db, 'users/' + currentUid + '/purchased');

  onValue(purchasedRef, (snapshot) => {
    const data = snapshot.val() || {};
    purchasedIds = new Set(Object.keys(data));
    renderTienda();
    renderComprados();
  });
}

// --- Comprar una skin: resta monedas de forma atomica (runTransaction,
// igual que RunTransaction en StoreManager.cs) y despues marca 'purchased' ---
function comprarSkin(id, boton) {
  const skin = currentSkins[id];
  if (!skin) return;

  boton.disabled = true;
  const textoOriginal = boton.textContent;
  boton.textContent = 'Comprando...';

  const coinsRef = ref(db, 'users/' + currentUid + '/coins');

  runTransaction(coinsRef, (saldoActual) => {
    const saldo = saldoActual || 0;
    if (saldo < skin.price) {
      return; // undefined = aborta la transaccion, no descuenta nada
    }
    return saldo - skin.price;
  }).then((resultado) => {
    if (!resultado.committed) {
      boton.disabled = false;
      boton.textContent = textoOriginal;
      alert('No te alcanzan las monedas para "' + skin.name + '".');
      return;
    }

    const purchasedRef = ref(db, 'users/' + currentUid + '/purchased/' + id);
    set(purchasedRef, true);
    // no hace falta tocar el boton a mano: el listener de "purchased"
    // vuelve a dibujar las tarjetas apenas se confirme la compra
  }).catch((error) => {
    boton.disabled = false;
    boton.textContent = textoOriginal;
    alert('Error al comprar: ' + error.message + ' (revisa las reglas de Firebase)');
  });
}

// --- Dibuja una tarjeta de skin. modo: 'tienda' muestra boton de comprar,
// 'comprados' solo muestra la tarjeta ya adquirida ---
function crearTarjeta(id, skin, modo) {
  const card = document.createElement('div');
  const yaComprada = purchasedIds.has(id);
  card.className = 'skin-card' + (yaComprada ? ' owned' : '');

  card.innerHTML = `
    <img src="images/${skin.img}.png">
    <h3>${skin.name}</h3>
    <p>${skin.price} monedas</p>
  `;

  if (modo === 'tienda') {
    const boton = document.createElement('button');
    boton.className = 'buy-btn';

    if (yaComprada) {
      boton.textContent = 'Comprada';
      boton.disabled = true;
    } else if (currentCoins < skin.price) {
      boton.textContent = 'Sin saldo';
      boton.disabled = true;
    } else {
      boton.textContent = 'Comprar';
      boton.addEventListener('click', () => comprarSkin(id, boton));
    }

    card.appendChild(boton);
  }

  return card;
}

function renderTienda() {
  grid.innerHTML = '';
  Object.entries(currentSkins).forEach(([id, skin]) => {
    grid.appendChild(crearTarjeta(id, skin, 'tienda'));
  });
}

function renderComprados() {
  compradosGrid.innerHTML = '';
  const idsComprados = Object.keys(currentSkins).filter((id) => purchasedIds.has(id));

  if (idsComprados.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'empty-msg';
    msg.textContent = 'Todavía no compraste nada.';
    compradosGrid.appendChild(msg);
    return;
  }

  idsComprados.forEach((id) => {
    compradosGrid.appendChild(crearTarjeta(id, currentSkins[id], 'comprados'));
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
