// frontend/js/perfil.js
document.addEventListener('DOMContentLoaded', () => {
  const auth = protegerPagina();
  if (auth) {
    cargarPerfil();
    cargarMisRecetas();
    configurarEdicionPerfil();
    configurarCambioPassword();
    configurarCambioEmail();
  }
});

// Cargar información del perfil
async function cargarPerfil() {
  try {
    const response = await fetch(`${API_URL}/users/perfil`, {
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      mostrarPerfil(data.usuario);
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
  }
}

// Mostrar información del perfil
function mostrarPerfil(usuario) {
  document.getElementById('perfil-loading').style.display = 'none';
  document.getElementById('perfil-container').style.display = 'block';

  document.getElementById('perfil-nombre').textContent = usuario.nombre;
  document.getElementById('perfil-email').textContent = usuario.email;
  document.getElementById('perfil-rol').textContent = usuario.rol.toUpperCase();
  
  if (usuario.biografia) {
    document.getElementById('perfil-biografia').textContent = usuario.biografia;
  }

  // Mostrar preferencias dietéticas
  const prefsContainer = document.getElementById('perfil-preferencias');
  if (usuario.preferenciasDieteticas && usuario.preferenciasDieteticas.length > 0) {
    prefsContainer.innerHTML = usuario.preferenciasDieteticas
      .map(pref => `<span class="badge bg-success me-1">${pref}</span>`)
      .join('');
  } else {
    prefsContainer.innerHTML = '<span class="text-muted">No especificadas</span>';
  }

  if (usuario.rol === 'chef' || usuario.rol === 'administrador') {
    document.getElementById('nav-crear').style.display = 'block';
  }

  // Pre-llenar formulario de edición
  document.getElementById('editar-nombre').value = usuario.nombre;
  document.getElementById('editar-biografia').value = usuario.biografia || '';

  // Pre-marcar preferencias dietéticas
  if (usuario.preferenciasDieteticas) {
    usuario.preferenciasDieteticas.forEach(pref => {
      const checkbox = document.getElementById(`pref-${pref}`);
      if (checkbox) checkbox.checked = true;
    });
  }
}

// Cargar recetas creadas por el usuario
async function cargarMisRecetas() {
  const container = document.getElementById('mis-recetas-container');
  
  try {
    const response = await fetch(`${API_URL}/users/perfil`, {
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success && data.recetasCreadas && data.recetasCreadas.length > 0) {
      container.innerHTML = '';
      data.recetasCreadas.forEach(receta => {
        container.innerHTML += crearTarjetaReceta(receta);
      });
    } else {
      container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No has creado recetas aún</p></div>';
    }
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error al cargar recetas</p></div>';
  }
}

// Cargar favoritos al hacer clic en el tab
document.getElementById('favoritos-tab').addEventListener('click', async () => {
  const container = document.getElementById('favoritos-container');
  container.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>';

  try {
    const response = await fetch(`${API_URL}/users/favoritos`, {
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success && data.favoritos && data.favoritos.length > 0) {
      container.innerHTML = '';
      data.favoritos.forEach(receta => {
        container.innerHTML += crearTarjetaReceta(receta);
      });
    } else {
      container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No tienes recetas favoritas</p></div>';
    }
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error al cargar favoritos</p></div>';
  }
});

// Configurar formulario de edición de perfil
function configurarEdicionPerfil() {
  const form = document.getElementById('form-editar-perfil');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('editar-nombre').value.trim();
    const biografia = document.getElementById('editar-biografia').value.trim();
    
    // Obtener preferencias dietéticas seleccionadas
    const preferenciasDieteticas = [];
    ['vegetariano', 'vegano', 'sin-gluten', 'sin-lactosa', 'ninguna'].forEach(pref => {
      const checkbox = document.getElementById(`pref-${pref}`);
      if (checkbox && checkbox.checked) {
        preferenciasDieteticas.push(pref);
      }
    });

    try {
      const response = await fetch(`${API_URL}/users/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify({ nombre, biografia, preferenciasDieteticas })
      });

      const data = await response.json();

      if (data.success) {
        mostrarMensajeModal('mensaje-editar-perfil', '✅ Perfil actualizado exitosamente', 'success');
        setTimeout(() => {
          bootstrap.Modal.getInstance(document.getElementById('modalEditarPerfil')).hide();
          location.reload();
        }, 1500);
      } else {
        mostrarMensajeModal('mensaje-editar-perfil', data.message || 'Error al actualizar perfil', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensajeModal('mensaje-editar-perfil', 'Error de conexión', 'error');
    }
  });
}

// Configurar formulario de cambio de contraseña
function configurarCambioPassword() {
  const form = document.getElementById('form-cambiar-password');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const passwordActual = document.getElementById('password-actual').value;
    const passwordNueva = document.getElementById('password-nueva').value;
    const passwordConfirmar = document.getElementById('password-confirmar').value;

    // Validar que las contraseñas coincidan
    if (passwordNueva !== passwordConfirmar) {
      mostrarMensajeModal('mensaje-cambiar-password', '❌ Las contraseñas no coinciden', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify({ passwordActual, passwordNueva })
      });

      const data = await response.json();

      if (data.success) {
        mostrarMensajeModal('mensaje-cambiar-password', '✅ Contraseña actualizada exitosamente', 'success');
        form.reset();
        setTimeout(() => {
          bootstrap.Modal.getInstance(document.getElementById('modalCambiarPassword')).hide();
        }, 2000);
      } else {
        mostrarMensajeModal('mensaje-cambiar-password', data.message || 'Error al cambiar contraseña', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensajeModal('mensaje-cambiar-password', 'Error de conexión', 'error');
    }
  });
}

// Configurar formulario de cambio de email
function configurarCambioEmail() {
  const form = document.getElementById('form-cambiar-email');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoEmail = document.getElementById('email-nuevo').value.trim();
    const password = document.getElementById('email-password').value;

    try {
      const response = await fetch(`${API_URL}/users/cambiar-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify({ nuevoEmail, password })
      });

      const data = await response.json();

      if (data.success) {
        mostrarMensajeModal('mensaje-cambiar-email', '✅ Email actualizado exitosamente. Redirigiendo...', 'success');
        form.reset();
        
        // Actualizar usuario en localStorage
        const usuario = obtenerUsuario();
        usuario.email = data.nuevoEmail;
        localStorage.setItem('usuario', JSON.stringify(usuario));

        setTimeout(() => {
          bootstrap.Modal.getInstance(document.getElementById('modalCambiarEmail')).hide();
          location.reload();
        }, 2000);
      } else {
        mostrarMensajeModal('mensaje-cambiar-email', data.message || 'Error al cambiar email', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensajeModal('mensaje-cambiar-email', 'Error de conexión', 'error');
    }
  });
}

// Función para crear tarjetas de recetas
function crearTarjetaReceta(receta) {
  return `
    <div class="col-md-6 mb-3">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${receta.titulo}</h5>
          <p class="card-text">${receta.descripcion ? receta.descripcion.substring(0, 80) + '...' : ''}</p>
          <div class="d-flex justify-content-between align-items-center">
            <small>⭐ ${receta.calificacionPromedio ? receta.calificacionPromedio.toFixed(1) : '0.0'}</small>
            <small>👁️ ${receta.vistas || 0} vistas</small>
          </div>
          <a href="ver_receta.html?id=${receta._id}" class="btn btn-sm btn-primary w-100 mt-2">Ver Receta</a>
        </div>
      </div>
    </div>
  `;
}

// Función auxiliar para mostrar mensajes en modales
function mostrarMensajeModal(containerId, mensaje, tipo) {
  const container = document.getElementById(containerId);
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
    }, 3000);
  }
}