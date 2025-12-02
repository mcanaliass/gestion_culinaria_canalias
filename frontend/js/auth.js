// Verificar si el usuario está autenticado
function verificarAutenticacion() {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  
  if (token && usuario) {
    mostrarMenuAutenticado(usuario);
    return { token, usuario };
  } else {
    mostrarMenuPublico();
    return null;
  }
}

// Mostrar menú para usuarios autenticados
function mostrarMenuAutenticado(usuario) {
  const navPerfil = document.getElementById('nav-perfil');
  const navCrear = document.getElementById('nav-crear');
  const navLogin = document.getElementById('nav-login');
  const navRegistro = document.getElementById('nav-registro');
  const navLogout = document.getElementById('nav-logout');

  if (navPerfil) navPerfil.style.display = 'block';
  if (navCrear && (usuario.rol === 'chef' || usuario.rol === 'administrador')) {
    navCrear.style.display = 'block';
  }
  if (navLogin) navLogin.style.display = 'none';
  if (navRegistro) navRegistro.style.display = 'none';
  if (navLogout) navLogout.style.display = 'block';

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
}

// Mostrar menú para usuarios no autenticados
function mostrarMenuPublico() {
  const navPerfil = document.getElementById('nav-perfil');
  const navCrear = document.getElementById('nav-crear');
  const navLogin = document.getElementById('nav-login');
  const navRegistro = document.getElementById('nav-registro');
  const navLogout = document.getElementById('nav-logout');

  if (navPerfil) navPerfil.style.display = 'none';
  if (navCrear) navCrear.style.display = 'none';
  if (navLogin) navLogin.style.display = 'block';
  if (navRegistro) navRegistro.style.display = 'block';
  if (navLogout) navLogout.style.display = 'none';
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

// Obtener token para peticiones
function obtenerToken() {
  return localStorage.getItem('token');
}

// Obtener usuario actual
function obtenerUsuario() {
  return JSON.parse(localStorage.getItem('usuario') || 'null');
}

// Mostrar mensaje
function mostrarMensaje(mensaje, tipo = 'success') {
  const container = document.getElementById('mensaje-container');
  if (!container) return;

  const claseAlerta = tipo === 'success' ? 'alert-success' : 'alert-danger';
  const icono = tipo === 'success' ? '✅' : '❌';

  container.innerHTML = `
    <div class="alert ${claseAlerta} alert-dismissible fade show" role="alert">
      ${icono} ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  if (tipo === 'success') {
    setTimeout(() => {
      container.innerHTML = '';
    }, 5000);
  }
}

// Proteger páginas que requieren autenticación
function protegerPagina() {
  const auth = verificarAutenticacion();
  if (!auth) {
    window.location.href = 'login.html';
  }
  return auth;
}

// Verificar si es chef
function esChef() {
  const usuario = obtenerUsuario();
  return usuario && (usuario.rol === 'chef' || usuario.rol === 'administrador');
}

// Inicializar verificación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacion();
});