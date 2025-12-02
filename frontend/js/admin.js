// frontend/js/admin.js
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que el usuario sea administrador
  const auth = protegerPagina();
  const usuario = obtenerUsuario();
  
  if (usuario.rol !== 'administrador') {
    alert('❌ Acceso denegado. Solo los administradores pueden acceder a esta página.');
    window.location.href = 'index.html';
    return;
  }

  cargarEstadisticas();
  configurarFormularioCrearAdmin();
});

// Cargar estadísticas del sistema
async function cargarEstadisticas() {
  try {
    const response = await fetch(`${API_URL}/admin/estadisticas`, {
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('stat-usuarios').textContent = data.estadisticas.totalUsuarios;
      document.getElementById('stat-chefs').textContent = data.estadisticas.totalChefs;
      document.getElementById('stat-admins').textContent = data.estadisticas.totalAdmins;
      document.getElementById('stat-recetas').textContent = data.estadisticas.totalRecetas;
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
}

// Configurar formulario de crear administrador
function configurarFormularioCrearAdmin() {
  const form = document.getElementById('form-crear-admin');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('admin-nombre').value.trim();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const confirmarPassword = document.getElementById('admin-confirmar-password').value;
    const btnCrear = document.getElementById('btn-crear-admin');

    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      mostrarMensaje('Las contraseñas no coinciden', 'error');
      return;
    }

    // Deshabilitar botón
    btnCrear.disabled = true;
    btnCrear.textContent = 'Creando administrador...';

    try {
      const response = await fetch(`${API_URL}/admin/crear-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify({ nombre, email, password })
      });

      const data = await response.json();

      if (data.success) {
        mostrarMensaje('✅ Administrador creado exitosamente', 'success');
        form.reset();
        cargarEstadisticas(); // Actualizar estadísticas
      } else {
        mostrarMensaje(data.message || 'Error al crear administrador', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarMensaje('Error de conexión con el servidor', 'error');
    } finally {
      btnCrear.disabled = false;
      btnCrear.textContent = '✅ Crear Administrador';
    }
  });
}

// Cargar lista de usuarios cuando se haga clic en el tab
document.getElementById('usuarios-tab').addEventListener('click', async () => {
  const loading = document.getElementById('usuarios-loading');
  const container = document.getElementById('usuarios-container');
  const tbody = document.getElementById('usuarios-tbody');

  loading.style.display = 'block';
  container.style.display = 'none';

  try {
    const response = await fetch(`${API_URL}/admin/usuarios`, {
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      tbody.innerHTML = '';
      
      data.usuarios.forEach(usuario => {
        const rolBadge = {
          'usuario': 'bg-secondary',
          'chef': 'bg-success',
          'administrador': 'bg-danger'
        };

        const fecha = new Date(usuario.fechaRegistro).toLocaleDateString('es-ES');

        tbody.innerHTML += `
          <tr>
            <td>${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td><span class="badge ${rolBadge[usuario.rol]}">${usuario.rol.toUpperCase()}</span></td>
            <td>${fecha}</td>
            <td>${usuario.recetasFavoritas?.length || 0}</td>
          </tr>
        `;
      });

      loading.style.display = 'none';
      container.style.display = 'block';
    }
  } catch (error) {
    console.error('Error:', error);
    loading.style.display = 'none';
    mostrarMensaje('Error al cargar usuarios', 'error');
  }
});

function mostrarMensaje(mensaje, tipo) {
  const container = document.getElementById('mensaje-container');
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