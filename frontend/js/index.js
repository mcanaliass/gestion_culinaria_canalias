document.addEventListener('DOMContentLoaded', async () => {
  await cargarRecetasRecientes();
});

async function cargarRecetasRecientes() {
  const container = document.getElementById('recetas-recientes');

  try {
    const response = await fetch(`${API_URL}/recipes`);
    const data = await response.json();

    if (data.success && data.recetas.length > 0) {
      container.innerHTML = '';
      data.recetas.slice(0, 6).forEach(receta => {
        container.innerHTML += crearTarjetaReceta(receta);
      });
    } else {
      container.innerHTML = '<div class="col-12"><p class="text-center">No hay recetas disponibles</p></div>';
    }
  } catch (error) {
    console.error('Error al cargar recetas:', error);
    container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error al cargar las recetas</p></div>';
  }
}

function crearTarjetaReceta(receta) {
  const tiempoTotal = receta.tiempoPreparacion + receta.tiempoCoccion;
  const dificultadTexto = {
    'facil': 'Fácil',
    'media': 'Media',
    'dificil': 'Difícil'
  };

  return `
    <div class="col-md-4 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${receta.titulo}</h5>
          <p class="card-text">${receta.descripcion.substring(0, 100)}...</p>
          <div class="mb-2">
            <span class="badge bg-primary">${receta.tipo}</span>
            <span class="badge bg-secondary">${dificultadTexto[receta.dificultad]}</span>
          </div>
          <p class="mb-1"><small>⏰ ${tiempoTotal} min</small></p>
          <p class="mb-2"><small>⭐ ${receta.calificacionPromedio.toFixed(1)} | 👁️ ${receta.vistas} vistas</small></p>
          <a href="ver_receta.html?id=${receta._id}" class="btn btn-primary btn-sm w-100">Ver Receta</a>
        </div>
      </div>
    </div>
  `;
}