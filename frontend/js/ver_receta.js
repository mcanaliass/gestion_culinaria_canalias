// frontend/js/ver_receta.js
let recetaActual = null; // Variable global para almacenar la receta

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const recetaId = params.get('id');

  if (!recetaId) {
    window.location.href = 'explorar.html';
    return;
  }

  await cargarReceta(recetaId);
});

async function cargarReceta(id) {
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`);
    const data = await response.json();

    if (data.success) {
      recetaActual = data.receta; // Guardar receta globalmente
      mostrarReceta(data.receta);
    } else {
      document.getElementById('receta-loading').innerHTML = '<p class="text-danger">Receta no encontrada</p>';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('receta-loading').innerHTML = '<p class="text-danger">Error al cargar la receta</p>';
  }
}

function mostrarReceta(receta) {
  document.getElementById('receta-loading').style.display = 'none';
  document.getElementById('receta-container').style.display = 'block';

  const costoTotal = receta.ingredientes.reduce((sum, ing) => sum + ing.costoEstimado, 0);

  const dificultadTexto = {
    'facil': 'Fácil',
    'media': 'Media',
    'dificil': 'Difícil'
  };

  document.getElementById('receta-titulo').textContent = receta.titulo;
  document.getElementById('receta-autor').textContent = receta.autor.nombre;
  document.getElementById('receta-vistas').textContent = receta.vistas;
  document.getElementById('receta-descripcion').textContent = receta.descripcion;
  document.getElementById('receta-tipo').textContent = receta.tipo.charAt(0).toUpperCase() + receta.tipo.slice(1);
  document.getElementById('receta-dificultad').textContent = dificultadTexto[receta.dificultad];
  document.getElementById('receta-ocasion').textContent = receta.ocasion.charAt(0).toUpperCase() + receta.ocasion.slice(1);
  document.getElementById('receta-tiempo-prep').textContent = receta.tiempoPreparacion;
  document.getElementById('receta-tiempo-coc').textContent = receta.tiempoCoccion;
  document.getElementById('receta-porciones').textContent = receta.porciones;
  document.getElementById('receta-costo-total').textContent = '₡' + costoTotal.toFixed(2);
  document.getElementById('receta-costo').textContent = '₡' + receta.costoPorPorcion.toFixed(2);

  // ARREGLO: Mostrar información de receta original
  if (receta.recetaOriginal) {
    const infoOriginal = document.getElementById('receta-original-info');
    const linkOriginal = document.getElementById('receta-original-link');
    const linkAutorOriginal = document.getElementById('receta-autor-original-link');
    
    infoOriginal.style.display = 'block';
    
    // Link a la receta original
    linkOriginal.href = `ver_receta.html?id=${receta.recetaOriginal._id}`;
    linkOriginal.textContent = `"${receta.recetaOriginal.titulo}"`;
    
    // CRÍTICO: Link al perfil del autor ORIGINAL (no del usuario en sesión)
    if (receta.recetaOriginal.autor) {
      linkAutorOriginal.href = `perfil_publico.html?id=${receta.recetaOriginal.autor._id}`;
      linkAutorOriginal.textContent = receta.recetaOriginal.autor.nombre;
    }
  }

  // Mostrar ingredientes
  const ingredientesLista = document.getElementById('ingredientes-lista');
  ingredientesLista.innerHTML = '';
  receta.ingredientes.forEach(ing => {
    ingredientesLista.innerHTML += `<li>${ing.cantidad} ${ing.unidad} de ${ing.nombre} (₡${ing.costoEstimado.toFixed(2)})</li>`;
  });

  // Mostrar pasos
  const pasosLista = document.getElementById('pasos-lista');
  pasosLista.innerHTML = '';
  receta.pasos.forEach(paso => {
    pasosLista.innerHTML += `<li>${paso.descripcion}</li>`;
  });

  // Mostrar calificación
  document.getElementById('calificacion-promedio').textContent = receta.calificacionPromedio.toFixed(1);

  // Mostrar comentarios
  const comentariosLista = document.getElementById('comentarios-lista');
  comentariosLista.innerHTML = '';
  if (receta.comentarios.length === 0) {
    comentariosLista.innerHTML = '<p class="text-muted">No hay comentarios aún</p>';
  } else {
    receta.comentarios.forEach(comentario => {
      comentariosLista.innerHTML += `
        <div class="border-bottom pb-2 mb-2">
          <strong>${comentario.usuario.nombre}</strong>
          <p class="mb-0">${comentario.texto}</p>
          <small class="text-muted">${new Date(comentario.fecha).toLocaleDateString()}</small>
        </div>
      `;
    });
  }

  // Verificar autenticación y mostrar controles correspondientes
  const auth = verificarAutenticacion();
  if (auth) {
    document.getElementById('acciones-card').style.display = 'block';
    document.getElementById('calificar-container').style.display = 'block';
    document.getElementById('form-comentario').style.display = 'block';

    // Verificar si el usuario actual es el autor de la receta
    if (auth.usuario.id === receta.autor._id) {
      document.getElementById('acciones-autor').style.display = 'block';
    }

    // NUEVO: Verificar si ya está en favoritos
    verificarEstadoFavorito(receta._id);
  }

  // IMPORTANTE: Configurar acciones AL FINAL
  configurarAcciones(receta._id);
}

// NUEVO: Verificar si la receta está en favoritos
async function verificarEstadoFavorito(recetaId) {
  try {
    const response = await fetch(`${API_URL}/users/perfil`, {
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      const usuario = data.usuario;
      const estaEnFavoritos = usuario.recetasFavoritas.some(fav => 
        (fav._id || fav) === recetaId
      );

      const btnFavorito = document.getElementById('btn-favorito');
      if (estaEnFavoritos) {
        btnFavorito.textContent = '❤️ Quitar de Favoritos';
        btnFavorito.classList.remove('btn-success');
        btnFavorito.classList.add('btn-danger');
        btnFavorito.dataset.enFavoritos = 'true';
      } else {
        btnFavorito.textContent = '💚 Agregar a Favoritos';
        btnFavorito.classList.remove('btn-danger');
        btnFavorito.classList.add('btn-success');
        btnFavorito.dataset.enFavoritos = 'false';
      }
    }
  } catch (error) {
    console.error('Error al verificar favoritos:', error);
  }
}

function configurarAcciones(recetaId) {
  // Configurar estrellas de calificación
  const botonesEstrella = document.querySelectorAll('.btn-star');
  
  // Efecto hover
  botonesEstrella.forEach((btn, index) => {
    btn.addEventListener('mouseenter', () => {
      botonesEstrella.forEach((b, i) => {
        if (i <= index) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    });
    
    // Click para calificar
    btn.addEventListener('click', () => {
      const estrellas = parseInt(btn.dataset.estrellas);
      calificarReceta(recetaId, estrellas);
    });
  });
  
  // Resetear al salir del contenedor
  const ratingContainer = document.querySelector('.rating-stars');
  if (ratingContainer) {
    ratingContainer.addEventListener('mouseleave', () => {
      botonesEstrella.forEach(b => b.classList.remove('active'));
    });
  }

  // Configurar formulario de comentarios
  const formComentario = document.getElementById('form-comentario');
  if (formComentario) {
    formComentario.addEventListener('submit', (e) => {
      e.preventDefault();
      comentarReceta(recetaId);
    });
  }

  // Configurar botones de acciones
  const btnFavorito = document.getElementById('btn-favorito');
  const btnVersionDerivada = document.getElementById('btn-version-derivada');
  const btnEditar = document.getElementById('btn-editar');
  const btnEliminar = document.getElementById('btn-eliminar');

  // MEJORADO: Toggle favoritos
  if (btnFavorito) {
    btnFavorito.addEventListener('click', async () => {
      const estaEnFavoritos = btnFavorito.dataset.enFavoritos === 'true';
      
      if (estaEnFavoritos) {
        await quitarDeFavoritos(recetaId);
      } else {
        await agregarAFavoritos(recetaId);
      }
    });
  }

  if (btnVersionDerivada) {
    btnVersionDerivada.addEventListener('click', () => {
      crearVersionDerivada(recetaId);
    });
  }

  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      window.location.href = `editar_receta.html?id=${recetaId}`;
    });
  }

  if (btnEliminar) {
    btnEliminar.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
        eliminarReceta(recetaId);
      }
    });
  }
}

async function calificarReceta(id, estrellas) {
  try {
    const response = await fetch(`${API_URL}/recipes/${id}/calificar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obtenerToken()}`
      },
      body: JSON.stringify({ estrellas })
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('calificacion-promedio').textContent = data.calificacionPromedio.toFixed(1);
      
      // Mostrar mensaje de éxito más amigable
      const mensaje = document.createElement('div');
      mensaje.className = 'alert alert-success alert-dismissible fade show mt-3';
      mensaje.innerHTML = `
        ✅ ¡Calificación registrada! (${estrellas} estrellas)
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.getElementById('calificar-container').appendChild(mensaje);
      
      setTimeout(() => {
        mensaje.remove();
      }, 3000);
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al calificar');
  }
}

async function comentarReceta(id) {
  const texto = document.getElementById('comentario-texto').value.trim();

  if (!texto) {
    alert('Por favor escribe un comentario');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/recipes/${id}/comentar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obtenerToken()}`
      },
      body: JSON.stringify({ texto })
    });

    const data = await response.json();

    if (data.success) {
      // Recargar solo los comentarios en vez de toda la página
      document.getElementById('comentario-texto').value = '';
      location.reload(); // Temporal - se puede mejorar con actualización dinámica
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al comentar');
  }
}

// MEJORADO: Agregar a favoritos con feedback visual
async function agregarAFavoritos(id) {
  try {
    const response = await fetch(`${API_URL}/users/favoritos/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      const btnFavorito = document.getElementById('btn-favorito');
      btnFavorito.textContent = '❤️ Quitar de Favoritos';
      btnFavorito.classList.remove('btn-success');
      btnFavorito.classList.add('btn-danger');
      btnFavorito.dataset.enFavoritos = 'true';
      
      // Mensaje de éxito
      alert('✅ Receta agregada a favoritos');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al agregar a favoritos');
  }
}

// NUEVO: Quitar de favoritos
async function quitarDeFavoritos(id) {
  try {
    const response = await fetch(`${API_URL}/users/favoritos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      const btnFavorito = document.getElementById('btn-favorito');
      btnFavorito.textContent = '💚 Agregar a Favoritos';
      btnFavorito.classList.remove('btn-danger');
      btnFavorito.classList.add('btn-success');
      btnFavorito.dataset.enFavoritos = 'false';
      
      // Mensaje de éxito
      alert('✅ Receta quitada de favoritos');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al quitar de favoritos');
  }
}

async function crearVersionDerivada(id) {
  window.location.href = `crear_receta.html?derivada=${id}`;
}

async function eliminarReceta(id) {
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });

    const data = await response.json();

    if (data.success) {
      alert('✅ Receta eliminada exitosamente');
      window.location.href = 'perfil.html';
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar receta');
  }
}