// frontend/js/perfil_publico.js

document.addEventListener('DOMContentLoaded', () => {
  // Configurar navegación según estado de autenticación
  configurarNavegacion();
  
  // Obtener el ID del usuario de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const usuarioId = urlParams.get('id');

  if (!usuarioId) {
    mostrarError('No se especificó un usuario');
    return;
  }

  // Cargar el perfil público
  cargarPerfilPublico(usuarioId);
});

// Configurar navegación según si el usuario está logueado
function configurarNavegacion() {
  // Verificar si hay token y usuario SIN modificar localStorage
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;

  // Elementos del menú
  const navPerfilLogueado = document.getElementById('nav-perfil-logueado');
  const navCrear = document.getElementById('nav-crear');
  const navAdmin = document.getElementById('nav-admin');
  const navLogin = document.getElementById('nav-login');
  const navLogout = document.getElementById('nav-logout');

  if (token && usuario) {
    // Usuario logueado - mostrar opciones de usuario autenticado
    if (navPerfilLogueado) navPerfilLogueado.style.display = 'block';
    if (navLogout) navLogout.style.display = 'block';
    if (navLogin) navLogin.style.display = 'none';
    
    if (usuario.rol === 'chef' || usuario.rol === 'administrador') {
      if (navCrear) navCrear.style.display = 'block';
    }
    
    if (usuario.rol === 'administrador') {
      if (navAdmin) navAdmin.style.display = 'block';
    }

    // Configurar botón de logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        cerrarSesion();
      });
    }
  } else {
    // Usuario NO logueado - mostrar opciones públicas
    if (navPerfilLogueado) navPerfilLogueado.style.display = 'none';
    if (navCrear) navCrear.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
    if (navLogout) navLogout.style.display = 'none';
    if (navLogin) navLogin.style.display = 'block';
  }
}

// Cargar perfil público de un usuario
async function cargarPerfilPublico(usuarioId) {
  try {
    // Preparar headers (incluir token SOLO si existe, pero no es obligatorio)
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/users/perfil-publico/${usuarioId}`, {
      headers: headers
    });

    const data = await response.json();

    if (data.success && data.usuario) {
      mostrarPerfilPublico(data.usuario, data.recetas || []);
    } else {
      mostrarError(data.message || 'No se pudo cargar el perfil');
    }
  } catch (error) {
    console.error('Error al cargar perfil público:', error);
    mostrarError('Error de conexión al cargar el perfil');
  }
}

// Mostrar información del perfil público
function mostrarPerfilPublico(usuario, recetas) {
  // Ocultar loading y mostrar perfil
  document.getElementById('perfil-loading').style.display = 'none';
  document.getElementById('perfil-container').style.display = 'block';

  // Información básica
  const inicial = usuario.nombre.charAt(0).toUpperCase();
  document.getElementById('perfil-inicial').textContent = inicial;
  document.getElementById('perfil-nombre').textContent = usuario.nombre;
  document.getElementById('perfil-email').textContent = usuario.email;
  document.getElementById('nombre-recetas').textContent = usuario.nombre;
  
  // Rol con formato
  const rolTexto = usuario.rol === 'chef' ? '👨‍🍳 Chef' : 
                   usuario.rol === 'administrador' ? '⚙️ Administrador' : 
                   '👤 Usuario';
  document.getElementById('perfil-rol').textContent = rolTexto;

  // Biografía
  if (usuario.biografia && usuario.biografia.trim() !== '') {
    document.getElementById('perfil-biografia').textContent = usuario.biografia;
  } else {
    document.getElementById('perfil-biografia').innerHTML = '<em class="text-muted">Sin biografía</em>';
  }

  // Preferencias dietéticas
  const prefsContainer = document.getElementById('perfil-preferencias');
  if (usuario.preferenciasDieteticas && usuario.preferenciasDieteticas.length > 0) {
    const preferenciasHTML = usuario.preferenciasDieteticas
      .map(pref => {
        const iconos = {
          'vegetariano': '🥗',
          'vegano': '🌱',
          'sin-gluten': '🌾',
          'sin-lactosa': '🥛',
          'ninguna': '🍽️'
        };
        const icono = iconos[pref] || '•';
        return `<span class="badge bg-success me-1 mb-1">${icono} ${formatearPreferencia(pref)}</span>`;
      })
      .join('');
    prefsContainer.innerHTML = preferenciasHTML;
  } else {
    prefsContainer.innerHTML = '<span class="text-muted small">No especificadas</span>';
  }

  // Estadísticas
  document.getElementById('perfil-total-recetas').textContent = recetas.length;
  
  const totalVistas = recetas.reduce((sum, receta) => sum + (receta.vistas || 0), 0);
  document.getElementById('perfil-total-vistas').textContent = totalVistas.toLocaleString();

  // Mostrar recetas
  mostrarRecetas(recetas);
}

// Mostrar recetas del usuario
function mostrarRecetas(recetas) {
  const container = document.getElementById('recetas-container');
  const contador = document.getElementById('contador-recetas');

  contador.textContent = `${recetas.length} ${recetas.length === 1 ? 'receta' : 'recetas'}`;

  if (recetas.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          <p class="mb-0">Este usuario aún no ha publicado recetas.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  recetas.forEach(receta => {
    container.innerHTML += crearTarjetaReceta(receta);
  });
}

// Crear tarjeta de receta
function crearTarjetaReceta(receta) {
  const calificacion = receta.calificacionPromedio || 0;
  const vistas = receta.vistas || 0;
  const descripcion = receta.descripcion 
    ? (receta.descripcion.length > 100 
        ? receta.descripcion.substring(0, 100) + '...' 
        : receta.descripcion)
    : 'Sin descripción';

  // Determinar dificultad con emojis
  const dificultadIconos = {
    'fácil': '🟢 Fácil',
    'media': '🟡 Media',
    'difícil': '🔴 Difícil'
  };
  const dificultadTexto = dificultadIconos[receta.dificultad] || receta.dificultad;

  return `
    <div class="col-md-6 mb-3">
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0">${receta.titulo}</h5>
            <span class="badge bg-warning text-dark">⭐ ${calificacion.toFixed(1)}</span>
          </div>
          
          <p class="card-text text-muted small">${descripcion}</p>
          
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small class="text-muted">
              ${dificultadTexto}
            </small>
            <small class="text-muted">
              👁️ ${vistas.toLocaleString()} vistas
            </small>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              ⏱️ ${receta.tiempoPreparacion || 'N/A'} min
            </small>
            <small class="text-muted">
              🍽️ ${receta.porciones || 'N/A'} porciones
            </small>
          </div>
          
          <a href="ver_receta.html?id=${receta._id}" class="btn btn-primary btn-sm w-100 mt-3">
            Ver Receta Completa
          </a>
        </div>
      </div>
    </div>
  `;
}

// Formatear preferencias dietéticas
function formatearPreferencia(pref) {
  const nombres = {
    'vegetariano': 'Vegetariano',
    'vegano': 'Vegano',
    'sin-gluten': 'Sin Gluten',
    'sin-lactosa': 'Sin Lactosa',
    'ninguna': 'Ninguna'
  };
  return nombres[pref] || pref;
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
  document.getElementById('perfil-loading').style.display = 'none';
  document.getElementById('perfil-error').style.display = 'block';
  
  const errorDiv = document.getElementById('perfil-error');
  errorDiv.querySelector('p').textContent = mensaje;
}

// Función de cerrar sesión (copiada de auth.js para no depender de él)
function cerrarSesion() {
  const body = document.body;
  
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  
  overlay.innerHTML = `
    <div class="text-center text-white">
      <div class="spinner-border mb-3" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cerrando sesión...</span>
      </div>
      <h3>Cerrando sesión...</h3>
      <p>¡Hasta pronto! 👋</p>
    </div>
  `;
  
  body.appendChild(overlay);
  
  setTimeout(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
  }, 1000);
}