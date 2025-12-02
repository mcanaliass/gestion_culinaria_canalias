document.addEventListener('DOMContentLoaded', () => {
  const auth = protegerPagina();
  if (auth) {
    cargarPerfil();
    cargarMisRecetas();
    configurarEdicion();
  }
});

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

function mostrarPerfil(usuario) {
  document.getElementById('perfil-loading').style.display = 'none';
  document.getElementById('perfil-container').style.display = 'block';

  document.getElementById('perfil-nombre').textContent = usuario.nombre;
  document.getElementById('perfil-email').textContent = usuario.email;
  document.getElementById('perfil-rol').textContent = usuario.rol.toUpperCase();
  
  if (usuario.biografia) {
    document.getElementById('perfil-biografia').textContent = usuario.biografia;
  }

  if (usuario.rol === 'chef' || usuario.rol === 'administrador') {
    document.getElementById('nav-crear').style.display = 'block';
  }

  document.getElementById('editar-nombre').value = usuario.nombre;
  document.getElementById('editar-biografia').value = usuario.biografia || '';
}

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

function configurarEdicion() {
  const form = document.getElementById('form-editar-perfil');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('editar-nombre').value.trim();
    const biografia = document.getElementById('editar-biografia').value.trim();

    try {
      const response = await fetch(`${API_URL}/users/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${obtenerToken()}`
        },
        body: JSON.stringify({ nombre, biografia })
      });

      const data = await response.json();

      if (data.success) {
        alert('¡Perfil actualizado exitosamente!');
        bootstrap.Modal.getInstance(document.getElementById('modalEditarPerfil')).hide();
        location.reload();
      } else {
        alert(data.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  });
}

function crearTarjetaReceta(receta) {
  return `
    <div class="col-md-6 mb-3">
      <div class="card">
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