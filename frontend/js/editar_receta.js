let recetaId = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Página cargada');
  
  try {
    const auth = protegerPagina();
    console.log('Auth:', auth);
    
    if (!esChef()) {
      console.log('No es chef');
      mostrarMensaje('Solo los chefs pueden editar recetas', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }
    
    // Obtener ID de la receta de la URL
    const params = new URLSearchParams(window.location.search);
    recetaId = params.get('id');
    
    if (!recetaId) {
      mostrarMensaje('ID de receta no especificado', 'error');
      setTimeout(() => {
        window.location.href = 'perfil.html';
      }, 2000);
      return;
    }
    
    console.log('Cargando receta:', recetaId);
    await cargarReceta(recetaId);
    configurarFormulario();
    console.log('Formulario configurado');
    
  } catch (error) {
    console.error('Error:', error);
  }
});

async function cargarReceta(id) {
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`, {
      headers: {
        'Authorization': `Bearer ${obtenerToken()}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    const receta = data.receta;
    
    // Verificar que el usuario sea el autor
    const usuario = obtenerUsuario();
    if (receta.autor._id !== usuario.id) {
      mostrarMensaje('No tienes permiso para editar esta receta', 'error');
      setTimeout(() => {
        window.location.href = 'perfil.html';
      }, 2000);
      return;
    }
    
    // Llenar formulario con datos de la receta
    document.getElementById('titulo').value = receta.titulo;
    document.getElementById('descripcion').value = receta.descripcion;
    document.getElementById('tiempo-preparacion').value = receta.tiempoPreparacion;
    document.getElementById('tiempo-coccion').value = receta.tiempoCoccion;
    document.getElementById('porciones').value = receta.porciones;
    document.getElementById('tipo').value = receta.tipo;
    document.getElementById('dificultad').value = receta.dificultad;
    document.getElementById('ocasion').value = receta.ocasion;
    
    // Cargar ingredientes
    const containerIngredientes = document.getElementById('ingredientes-container');
    containerIngredientes.innerHTML = '';
    receta.ingredientes.forEach(ing => {
      agregarIngrediente(ing);
    });
    
    // Cargar pasos
    const containerPasos = document.getElementById('pasos-container');
    containerPasos.innerHTML = '';
    receta.pasos.forEach((paso, index) => {
      agregarPaso(paso.descripcion);
    });
    
    // Mostrar formulario
    document.getElementById('loading').style.display = 'none';
    document.getElementById('form-editar-receta').style.display = 'block';
    
  } catch (error) {
    console.error('Error al cargar receta:', error);
    mostrarMensaje('Error al cargar la receta', 'error');
    setTimeout(() => {
      window.location.href = 'perfil.html';
    }, 2000);
  }
}

function configurarFormulario() {
  const form = document.getElementById('form-editar-receta');
  const btnAgregarIngrediente = document.getElementById('agregar-ingrediente');
  const btnAgregarPaso = document.getElementById('agregar-paso');

  btnAgregarIngrediente.addEventListener('click', () => agregarIngrediente());
  btnAgregarPaso.addEventListener('click', () => agregarPaso());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await editarReceta();
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-ingrediente')) {
      e.target.closest('.ingrediente-item').remove();
    }
    
    if (e.target.classList.contains('remove-paso')) {
      e.target.closest('.paso-item').remove();
      actualizarNumerosPasos();
    }
  });
}

function agregarIngrediente(datos = null) {
  const container = document.getElementById('ingredientes-container');
  const nuevoIngrediente = document.createElement('div');
  nuevoIngrediente.className = 'row ingrediente-item mb-2';
  nuevoIngrediente.innerHTML = `
    <div class="col-md-4">
      <input type="text" class="form-control ingrediente-nombre" placeholder="Nombre del ingrediente" required value="${datos ? datos.nombre : ''}">
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control ingrediente-cantidad" placeholder="Cantidad" min="0" step="0.01" required value="${datos ? datos.cantidad : ''}">
    </div>
    <div class="col-md-3">
      <select class="form-select ingrediente-unidad" required>
        <option value="">Unidad</option>
        <option value="gramos" ${datos && datos.unidad === 'gramos' ? 'selected' : ''}>Gramos</option>
        <option value="kilogramos" ${datos && datos.unidad === 'kilogramos' ? 'selected' : ''}>Kilogramos</option>
        <option value="litros" ${datos && datos.unidad === 'litros' ? 'selected' : ''}>Litros</option>
        <option value="mililitros" ${datos && datos.unidad === 'mililitros' ? 'selected' : ''}>Mililitros</option>
        <option value="tazas" ${datos && datos.unidad === 'tazas' ? 'selected' : ''}>Tazas</option>
        <option value="cucharadas" ${datos && datos.unidad === 'cucharadas' ? 'selected' : ''}>Cucharadas</option>
        <option value="cucharaditas" ${datos && datos.unidad === 'cucharaditas' ? 'selected' : ''}>Cucharaditas</option>
        <option value="unidades" ${datos && datos.unidad === 'unidades' ? 'selected' : ''}>Unidades</option>
        <option value="pizca" ${datos && datos.unidad === 'pizca' ? 'selected' : ''}>Pizca</option>
      </select>
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control ingrediente-costo" placeholder="Costo" min="0" step="0.01" required value="${datos ? datos.costoEstimado : ''}">
    </div>
    <div class="col-md-1">
      <button type="button" class="btn btn-danger btn-sm remove-ingrediente">X</button>
    </div>
  `;
  container.appendChild(nuevoIngrediente);
}

function agregarPaso(descripcion = '') {
  const container = document.getElementById('pasos-container');
  const numeroPaso = container.children.length + 1;
  const nuevoPaso = document.createElement('div');
  nuevoPaso.className = 'paso-item mb-3 border p-3 rounded';
  nuevoPaso.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <label class="form-label mb-0"><strong>Paso ${numeroPaso}</strong></label>
      <button type="button" class="btn btn-danger btn-sm remove-paso">Eliminar</button>
    </div>
    <textarea class="form-control paso-descripcion" rows="2" required maxlength="500">${descripcion}</textarea>
  `;
  container.appendChild(nuevoPaso);
}

function actualizarNumerosPasos() {
  const pasos = document.querySelectorAll('.paso-item');
  pasos.forEach((paso, index) => {
    const label = paso.querySelector('label');
    label.innerHTML = `<strong>Paso ${index + 1}</strong>`;
  });
}

async function editarReceta() {
  const btnGuardar = document.getElementById('btn-guardar');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const ingredientes = [];
    document.querySelectorAll('.ingrediente-item').forEach(item => {
      ingredientes.push({
        nombre: item.querySelector('.ingrediente-nombre').value.trim(),
        cantidad: parseFloat(item.querySelector('.ingrediente-cantidad').value),
        unidad: item.querySelector('.ingrediente-unidad').value,
        costoEstimado: parseFloat(item.querySelector('.ingrediente-costo').value)
      });
    });

    const pasos = [];
    document.querySelectorAll('.paso-item').forEach((item, index) => {
      pasos.push({
        numero: index + 1,
        descripcion: item.querySelector('.paso-descripcion').value.trim()
      });
    });

    const receta = {
      titulo: document.getElementById('titulo').value.trim(),
      descripcion: document.getElementById('descripcion').value.trim(),
      ingredientes,
      pasos,
      tiempoPreparacion: parseInt(document.getElementById('tiempo-preparacion').value),
      tiempoCoccion: parseInt(document.getElementById('tiempo-coccion').value),
      porciones: parseInt(document.getElementById('porciones').value),
      tipo: document.getElementById('tipo').value,
      dificultad: document.getElementById('dificultad').value,
      ocasion: document.getElementById('ocasion').value
    };

    const response = await fetch(`${API_URL}/recipes/${recetaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obtenerToken()}`
      },
      body: JSON.stringify(receta)
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensaje('¡Receta actualizada exitosamente!', 'success');
      setTimeout(() => {
        window.location.href = `ver_receta.html?id=${recetaId}`;
      }, 1500);
    } else {
      mostrarMensaje(data.message || 'Error al actualizar receta', 'error');
      btnGuardar.disabled = false;
      btnGuardar.textContent = 'Guardar Cambios';
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error de conexión con el servidor', 'error');
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar Cambios';
  }
}