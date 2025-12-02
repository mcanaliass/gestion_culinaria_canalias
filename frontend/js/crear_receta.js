document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔍 Página cargada');
  
  try {
    const auth = protegerPagina();
    console.log('✅ Auth:', auth);
    
    // Verificar si es una versión derivada
    const params = new URLSearchParams(window.location.search);
    const recetaDerivadaId = params.get('derivada');
    
    // Si NO es versión derivada, solo chefs pueden acceder
    if (!recetaDerivadaId && !esChef()) {
      console.log('No es chef y no es versión derivada');
      mostrarMensaje('Solo los chefs pueden crear recetas nuevas', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }
    
    // Si ES versión derivada, cualquier usuario autenticado puede acceder
    if (recetaDerivadaId) {
      console.log('Cargando receta original para versión derivada...');
      await cargarRecetaOriginal(recetaDerivadaId);
    } else {
      console.log('Modo crear receta nueva (solo chefs)');
      inicializarPasoExistente();
    }
    
    console.log('Configurando formulario...');
    configurarFormulario();
    console.log('Formulario configurado');
    
  } catch (error) {
    console.error('Error:', error);
  }
});

async function cargarRecetaOriginal(id) {
  try {
    const response = await fetch(`${API_URL}/recipes/${id}`);
    const data = await response.json();
    
    if (!data.success) {
      mostrarMensaje('No se pudo cargar la receta original', 'error');
      return;
    }
    
    const receta = data.receta;
    
    // Llenar formulario con datos de la receta original
    document.getElementById('titulo').value = receta.titulo + ' - Mi versión';
    document.getElementById('descripcion').value = receta.descripcion;
    document.getElementById('tiempo-preparacion').value = receta.tiempoPreparacion;
    document.getElementById('tiempo-coccion').value = receta.tiempoCoccion;
    document.getElementById('porciones').value = receta.porciones;
    document.getElementById('tipo').value = receta.tipo;
    document.getElementById('dificultad').value = receta.dificultad;
    document.getElementById('ocasion').value = receta.ocasion;
    
    // Limpiar contenedores
    document.getElementById('ingredientes-container').innerHTML = '';
    document.getElementById('pasos-container').innerHTML = '';
    
    // Cargar ingredientes
    receta.ingredientes.forEach(ing => {
      agregarIngrediente(ing);
    });
    
    // Cargar pasos
    receta.pasos.forEach(paso => {
      agregarPasoConDatos(paso.descripcion);
    });
    
    // Guardar ID de receta original en un campo oculto
    let inputOriginal = document.getElementById('receta-original-id');
    if (!inputOriginal) {
      inputOriginal = document.createElement('input');
      inputOriginal.type = 'hidden';
      inputOriginal.id = 'receta-original-id';
      inputOriginal.value = id;
      document.getElementById('form-crear-receta').appendChild(inputOriginal);
    } else {
      inputOriginal.value = id;
    }
    
    // Mostrar mensaje informativo
    mostrarMensaje('Editando versión derivada de: ' + receta.titulo, 'success');
    
    // Cambiar título de la página
      document.title = 'Crear Mi Versión - Cocinalias';
      document.querySelector('h1').textContent = 'Crear Mi Versión';
      
      // Cambiar texto del botón
      document.getElementById('btn-crear').textContent = 'Publicar Mi Versión';
      
    } catch (error) {
      console.error('Error al cargar receta original:', error);
      mostrarMensaje('Error al cargar la receta original', 'error');
    }
}

function agregarPasoConDatos(descripcion) {
  const container = document.getElementById('pasos-container');
  const numeroPaso = container.children.length + 1;
  const nuevoPaso = document.createElement('div');
  nuevoPaso.className = 'paso-item mb-3 border p-3 rounded';
  nuevoPaso.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <label class="form-label mb-0"><strong>Paso ${numeroPaso}</strong></label>
      <div>
        <button type="button" class="btn btn-warning btn-sm edit-paso me-2" style="display: none;">Editar</button>
        <button type="button" class="btn btn-danger btn-sm remove-paso">Eliminar</button>
      </div>
    </div>
    <textarea class="form-control paso-descripcion" rows="2" required maxlength="500">${descripcion}</textarea>
    <button type="button" class="btn btn-success btn-sm mt-2 lock-paso">Guardar paso</button>
  `;
  container.appendChild(nuevoPaso);
  actualizarNumerosPasos();
  
  // Configurar botón de bloqueo
  const lockBtn = nuevoPaso.querySelector('.lock-paso');
  const textarea = nuevoPaso.querySelector('.paso-descripcion');
  const editBtn = nuevoPaso.querySelector('.edit-paso');
  
  lockBtn.addEventListener('click', () => {
    if (textarea.value.trim()) {
      textarea.setAttribute('readonly', true);
      textarea.classList.add('bg-light');
      lockBtn.style.display = 'none';
      editBtn.style.display = 'inline-block';
    }
  });
  
  editBtn.addEventListener('click', () => {
    textarea.removeAttribute('readonly');
    textarea.classList.remove('bg-light');
    textarea.focus();
    lockBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
  });
}

function configurarFormulario() {
  const form = document.getElementById('form-crear-receta');
  const btnAgregarIngrediente = document.getElementById('agregar-ingrediente');
  const btnAgregarPaso = document.getElementById('agregar-paso');

  btnAgregarIngrediente.addEventListener('click', agregarIngrediente);
  btnAgregarPaso.addEventListener('click', agregarPaso);

  // Inicializar el Paso 1 que ya existe en el HTML
  inicializarPasoExistente();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearReceta();
  });

  // Eliminar ingredientes y pasos
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-ingrediente')) {
      e.target.closest('.ingrediente-item').remove();
    }
    
    if (e.target.classList.contains('remove-paso')) {
      const pasoItem = e.target.closest('.paso-item');
      pasoItem.remove();
      actualizarNumerosPasos();
    }
  });
}

function inicializarPasoExistente() {
  const primerPaso = document.querySelector('.paso-item');
  
  if (primerPaso && !primerPaso.querySelector('.lock-paso')) {
    // Modificar la estructura del paso existente
    const label = primerPaso.querySelector('label');
    const textarea = primerPaso.querySelector('.paso-descripcion');
    
    // contenedor para botones
    const botonesDiv = document.createElement('div');
    botonesDiv.className = 'd-flex justify-content-between align-items-center mb-2';
    
    botonesDiv.innerHTML = `
      <label class="form-label mb-0"><strong>Paso 1</strong></label>
      <div>
        <button type="button" class="btn btn-warning btn-sm edit-paso me-2" style="display: none;">Editar</button>
        <button type="button" class="btn btn-danger btn-sm remove-paso">Eliminar</button>
      </div>
    `;
    
    // Agregar clase y borde
    primerPaso.classList.add('border', 'p-3', 'rounded');
    
    // Reemplazar el label original
    label.remove();
    primerPaso.insertBefore(botonesDiv, textarea);
    
    // Agregar botón de guardar
    const lockBtn = document.createElement('button');
    lockBtn.type = 'button';
    lockBtn.className = 'btn btn-success btn-sm mt-2 lock-paso';
    lockBtn.textContent = 'Guardar paso';
    primerPaso.appendChild(lockBtn);
    
    // Configurar funcionalidad de bloqueo
    const editBtn = primerPaso.querySelector('.edit-paso');
    
    lockBtn.addEventListener('click', () => {
      if (textarea.value.trim()) {
        textarea.setAttribute('readonly', true);
        textarea.classList.add('bg-light');
        lockBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';
      }
    });
    
    editBtn.addEventListener('click', () => {
      textarea.removeAttribute('readonly');
      textarea.classList.remove('bg-light');
      textarea.focus();
      lockBtn.style.display = 'inline-block';
      editBtn.style.display = 'none';
    });
  }
}

function agregarIngrediente(datosIngrediente = null) {
  const container = document.getElementById('ingredientes-container');
  const nuevoIngrediente = document.createElement('div');
  nuevoIngrediente.className = 'row ingrediente-item mb-2';
  
  // Si hay datos, pre-llenar los valores, si no, dejar vacío
  const nombre = datosIngrediente?.nombre || '';
  const cantidad = datosIngrediente?.cantidad || '';
  const unidad = datosIngrediente?.unidad || '';
  const costo = datosIngrediente?.costoEstimado || '';
  
  nuevoIngrediente.innerHTML = `
    <div class="col-md-4">
      <input type="text" class="form-control ingrediente-nombre" placeholder="Nombre del ingrediente" value="${nombre}" required>
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control ingrediente-cantidad" placeholder="Cantidad" min="0" step="0.01" value="${cantidad}" required>
    </div>
    <div class="col-md-3">
      <select class="form-select ingrediente-unidad" required>
        <option value="">Unidad</option>
        <option value="gramos" ${unidad === 'gramos' ? 'selected' : ''}>Gramos</option>
        <option value="kilogramos" ${unidad === 'kilogramos' ? 'selected' : ''}>Kilogramos</option>
        <option value="litros" ${unidad === 'litros' ? 'selected' : ''}>Litros</option>
        <option value="mililitros" ${unidad === 'mililitros' ? 'selected' : ''}>Mililitros</option>
        <option value="tazas" ${unidad === 'tazas' ? 'selected' : ''}>Tazas</option>
        <option value="cucharadas" ${unidad === 'cucharadas' ? 'selected' : ''}>Cucharadas</option>
        <option value="cucharaditas" ${unidad === 'cucharaditas' ? 'selected' : ''}>Cucharaditas</option>
        <option value="unidades" ${unidad === 'unidades' ? 'selected' : ''}>Unidades</option>
        <option value="pizca" ${unidad === 'pizca' ? 'selected' : ''}>Pizca</option>
      </select>
    </div>
    <div class="col-md-2">
      <input type="number" class="form-control ingrediente-costo" placeholder="Costo" min="0" step="0.01" value="${costo}" required>
    </div>
    <div class="col-md-1">
      <button type="button" class="btn btn-danger btn-sm remove-ingrediente">X</button>
    </div>
  `;
  container.appendChild(nuevoIngrediente);
}

function agregarPaso() {
  const container = document.getElementById('pasos-container');
  const numeroPaso = container.children.length + 1;
  const nuevoPaso = document.createElement('div');
  nuevoPaso.className = 'paso-item mb-3 border p-3 rounded';
  nuevoPaso.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <label class="form-label mb-0"><strong>Paso ${numeroPaso}</strong></label>
      <div>
        <button type="button" class="btn btn-warning btn-sm edit-paso me-2" style="display: none;">Editar</button>
        <button type="button" class="btn btn-danger btn-sm remove-paso">Eliminar</button>
      </div>
    </div>
    <textarea class="form-control paso-descripcion" rows="2" required maxlength="500"></textarea>
    <button type="button" class="btn btn-success btn-sm mt-2 lock-paso">Guardar paso</button>
  `;
  container.appendChild(nuevoPaso);
  
  // Configurar botón de bloqueo
  const lockBtn = nuevoPaso.querySelector('.lock-paso');
  const textarea = nuevoPaso.querySelector('.paso-descripcion');
  const editBtn = nuevoPaso.querySelector('.edit-paso');
  
  lockBtn.addEventListener('click', () => {
    if (textarea.value.trim()) {
      textarea.setAttribute('readonly', true);
      textarea.classList.add('bg-light');
      lockBtn.style.display = 'none';
      editBtn.style.display = 'inline-block';
    }
  });
  
  editBtn.addEventListener('click', () => {
    textarea.removeAttribute('readonly');
    textarea.classList.remove('bg-light');
    textarea.focus();
    lockBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
  });
}

function actualizarNumerosPasos() {
  const pasos = document.querySelectorAll('.paso-item');
  pasos.forEach((paso, index) => {
    const label = paso.querySelector('label');
    label.innerHTML = `<strong>Paso ${index + 1}</strong>`;
  });
}

async function crearReceta() {
  const btnCrear = document.getElementById('btn-crear');
  btnCrear.disabled = true;
  btnCrear.textContent = 'Publicando...';

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

    // AGREGAR: Si es versión derivada, incluir referencia
    const recetaOriginalId = document.getElementById('receta-original-id');
    if (recetaOriginalId) {
      receta.recetaOriginal = recetaOriginalId.value;
    }

    const response = await fetch(`${API_URL}/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obtenerToken()}`
      },
      body: JSON.stringify(receta)
    });

    const data = await response.json();

    if (data.success) {
      mostrarMensaje('¡Receta creada exitosamente!', 'success');
      setTimeout(() => {
        window.location.href = `ver_receta.html?id=${data.receta._id}`;
      }, 1500);
    } else {
      mostrarMensaje(data.message || 'Error al crear receta', 'error');
      btnCrear.disabled = false;
      btnCrear.textContent = 'Publicar Receta';
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarMensaje('Error de conexión con el servidor', 'error');
    btnCrear.disabled = false;
    btnCrear.textContent = 'Publicar Receta';
  }
}