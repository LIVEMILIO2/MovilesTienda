// Login y registro con Firebase Auth (email + contraseña).
// Mismo proyecto de Firebase que usa app.js (firebase-config.js).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const tabs = document.querySelectorAll('.auth-tab');
const forms = document.querySelectorAll('.auth-form');
const messageEl = document.getElementById('auth-message');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Si ya hay sesion iniciada, no tiene caso quedarse en login.html
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'index.html';
  }
});

// --- Alternar entre pestañas Ingresar / Registrarse ---
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    forms.forEach((f) => f.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + '-form').classList.add('active');

    setMessage('', null);
  });
});

function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = type ? type : '';
}

function traducirError(error) {
  // Firebase manda codigos en ingles; los traducimos a mensajes claros.
  switch (error.code) {
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    default:
      return 'Error: ' + error.message;
  }
}

function setLoading(form, isLoading) {
  const btn = form.querySelector('.auth-submit');
  btn.disabled = isLoading;
  btn.textContent = isLoading ? 'Procesando...' : (form === loginForm ? 'Entrar' : 'Crear cuenta');
}

// --- Login ---
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('', null);

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  setLoading(loginForm, true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setMessage('Acceso concedido. Entrando...', 'success');
    // el redirect a index.html lo hace onAuthStateChanged
  } catch (error) {
    setMessage(traducirError(error), 'error');
  } finally {
    setLoading(loginForm, false);
  }
});

// --- Registro ---
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('', null);

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;

  if (password !== passwordConfirm) {
    setMessage('Las contraseñas no coinciden.', 'error');
    return;
  }

  setLoading(registerForm, true);
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }
    setMessage('Cuenta creada. Entrando...', 'success');
    // el redirect a index.html lo hace onAuthStateChanged
  } catch (error) {
    setMessage(traducirError(error), 'error');
  } finally {
    setLoading(registerForm, false);
  }
});
