document.addEventListener('DOMContentLoaded', async () => {
  await cargarRecetas();
  configurarBusqueda();
});

async function cargarRecetas(params = {}) {
  const container = document.getElementById('recetas-container');
  container.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>';

  try {
    const queryString = new URLSearchParams(params).toString();
    const url = params.busqueda || params.tipo || params.dificultad || params.tiempoMax
      ? `${API_URL}/recipes/buscar?${queryString}`
      : `${API_URL}/recipes`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.success && data.recetas.length > 0) {
      container.innerHTML = '';
      data.recetas.forEach(receta => {
        container.innerHTML += crearTarjetaReceta(receta);
      });
    } else {
      container.innerHTML = '<div class="col-12"><p class="text-center">No se encontraron recetas</p></div>';
    }
  } catch (error) {
    console.error('Error al cargar recetas:', error);
    container.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error al cargar las recetas</p></div>';
  }
}

function configurarBusqueda() {
  const form = document.getElementById('form-busqueda');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const params = {};
    const busqueda = document.getElementById('busqueda').value.trim();
    const tipo = document.getElementById('tipo').value;
    const dificultad = document.getElementById('dificultad').value;
    const tiempoMax = document.getElementById('tiempo-max').value;

    if (busqueda) params.busqueda = busqueda;
    if (tipo) params.tipo = tipo;
    if (dificultad) params.dificultad = dificultad;
    if (tiempoMax) params.tiempoMax = tiempoMax;

    cargarRecetas(params);
  });
}

function crearTarjetaReceta(receta) {
  const tiempoTotal = receta.tiempoPreparacion + receta.tiempoCoccion;
  const dificultadTexto = {
    'facil': 'Fácil',
    'media': 'Media',
    'dificil': 'Difícil'
  };

  return `
    <div class="col-md-4 col-lg-3 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${receta.titulo}</h5>
          <p class="card-text">${receta.descripcion.substring(0, 80)}...</p>
          <div class="mb-2">
            <span class="badge bg-primary">${receta.tipo}</span>
            <span class="badge bg-secondary">${dificultadTexto[receta.dificultad]}</span>
          </div>
          <p class="mb-1"><small>⏰ ${tiempoTotal} min | 🍽️ ${receta.porciones} porciones</small></p>
          <p class="mb-2"><small>💰 ₡${receta.costoPorPorcion.toFixed(2)} por porción</small></p>
          <p class="mb-3"><small>⭐ ${receta.calificacionPromedio.toFixed(1)}</small></p>
          <a href="ver_receta.html?id=${receta._id}" class="btn btn-primary btn-sm w-100">Ver Receta</a>
        </div>
      </div>
    </div>
  `;
}