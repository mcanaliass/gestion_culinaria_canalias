const Recipe = require('../models/recipe');
const User = require('../models/user');

// Obtener todas las recetas
exports.obtenerRecetas = async (req, res) => {
  try {
    const recetas = await Recipe.find({ estado: 'publicada' })
      .populate('autor', 'nombre fotoPerfil')
      .sort({ fechaCreacion: -1 })
      .limit(20);

    res.json({
      success: true,
      recetas
    });
  } catch (error) {
    console.error('Error al obtener recetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recetas'
    });
  }
};

// Buscar recetas con filtros
exports.buscarRecetas = async (req, res) => {
  try {
    const { busqueda, tipo, dificultad, tiempoMax, presupuestoMax } = req.query;
    
    let filtros = { estado: 'publicada' };

    // Búsqueda por texto
    if (busqueda) {
      filtros.$or = [
        { titulo: { $regex: busqueda, $options: 'i' } },
        { descripcion: { $regex: busqueda, $options: 'i' } }
      ];
    }

    // Filtros adicionales
    if (tipo) filtros.tipo = tipo;
    if (dificultad) filtros.dificultad = dificultad;
    if (tiempoMax) {
      const tiempo = parseInt(tiempoMax);
      filtros.$expr = {
        $lte: [{ $add: ['$tiempoPreparacion', '$tiempoCoccion'] }, tiempo]
      };
    }
    if (presupuestoMax) filtros.costoPorPorcion = { $lte: parseFloat(presupuestoMax) };

    const recetas = await Recipe.find(filtros)
      .populate('autor', 'nombre fotoPerfil')
      .sort({ calificacionPromedio: -1, fechaCreacion: -1 })
      .limit(50);

    res.json({
      success: true,
      cantidad: recetas.length,
      recetas
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar recetas'
    });
  }
};

// Obtener receta por ID
exports.obtenerRecetaPorId = async (req, res) => {
  try {
    const receta = await Recipe.findById(req.params.id)
      .populate('autor', 'nombre fotoPerfil biografia')
      .populate('comentarios.usuario', 'nombre fotoPerfil')
      .populate('recetaOriginal', 'titulo autor');

    if (!receta) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    // Incrementar vistas
    receta.vistas += 1;
    await receta.save();

    res.json({
      success: true,
      receta
    });
  } catch (error) {
    console.error('Error al obtener receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener receta'
    });
  }
};

// Crear nueva receta
exports.crearReceta = async (req, res) => {
  try {
    const { titulo, descripcion, ingredientes, pasos, tiempoPreparacion, 
            tiempoCoccion, porciones, tipo, dificultad, ocasion, estado } = req.body;

    // Validaciones
    if (!titulo || !descripcion || !ingredientes || !pasos) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos obligatorios'
      });
    }

    if (!tiempoPreparacion || !tiempoCoccion || !porciones) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa tiempos y porciones'
      });
    }

    const nuevaReceta = new Recipe({
      titulo,
      descripcion,
      autor: req.usuario.id,
      ingredientes,
      pasos,
      tiempoPreparacion,
      tiempoCoccion,
      porciones,
      tipo,
      dificultad,
      ocasion,
      estado: estado || 'publicada'
    });

    await nuevaReceta.save();

    await nuevaReceta.populate('autor', 'nombre fotoPerfil');

    res.status(201).json({
      success: true,
      message: 'Receta creada exitosamente',
      receta: nuevaReceta
    });
  } catch (error) {
    console.error('Error al crear receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear receta'
    });
  }
};

// Editar receta
exports.editarReceta = async (req, res) => {
  try {
    const receta = await Recipe.findById(req.params.id);

    if (!receta) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    // Verificar que el usuario sea el autor
    if (receta.autor.toString() !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta receta'
      });
    }

    // Actualizar campos
    const camposPermitidos = ['titulo', 'descripcion', 'ingredientes', 'pasos', 
      'tiempoPreparacion', 'tiempoCoccion', 'porciones', 'tipo', 'dificultad', 'ocasion'];
    
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        receta[campo] = req.body[campo];
      }
    });

    await receta.save();

    res.json({
      success: true,
      message: 'Receta actualizada exitosamente',
      receta
    });
  } catch (error) {
    console.error('Error al editar receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al editar receta'
    });
  }
};

// Eliminar receta
exports.eliminarReceta = async (req, res) => {
  try {
    const receta = await Recipe.findById(req.params.id);

    if (!receta) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    // Verificar que el usuario sea el autor
    if (receta.autor.toString() !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta receta'
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Receta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar receta'
    });
  }
};

// Calificar receta
exports.calificarReceta = async (req, res) => {
  try {
    const { estrellas } = req.body;
    const receta = await Recipe.findById(req.params.id);

    if (!receta) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    // Validar estrellas
    if (!estrellas || estrellas < 1 || estrellas > 5) {
      return res.status(400).json({
        success: false,
        message: 'La calificación debe estar entre 1 y 5 estrellas'
      });
    }

    // Buscar si el usuario ya calificó
    const indiceCalificacion = receta.calificaciones.findIndex(
      cal => cal.usuario.toString() === req.usuario.id
    );

    if (indiceCalificacion > -1) {
      // Actualizar calificación existente
      receta.calificaciones[indiceCalificacion].estrellas = estrellas;
      receta.calificaciones[indiceCalificacion].fecha = Date.now();
    } else {
      // Agregar nueva calificación
      receta.calificaciones.push({
        usuario: req.usuario.id,
        estrellas
      });
    }

    receta.calcularCalificacionPromedio();
    await receta.save();

    res.json({
      success: true,
      message: 'Calificación registrada exitosamente',
      calificacionPromedio: receta.calificacionPromedio
    });
  } catch (error) {
    console.error('Error al calificar receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calificar receta'
    });
  }
};

// Comentar receta
exports.comentarReceta = async (req, res) => {
  try {
    const { texto } = req.body;
    const receta = await Recipe.findById(req.params.id);

    if (!receta) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El comentario no puede estar vacío'
      });
    }

    if (texto.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'El comentario no puede exceder 500 caracteres'
      });
    }

    receta.comentarios.push({
      usuario: req.usuario.id,
      texto
    });

    await receta.save();
    await receta.populate('comentarios.usuario', 'nombre fotoPerfil');

    res.json({
      success: true,
      message: 'Comentario agregado exitosamente',
      comentarios: receta.comentarios
    });
  } catch (error) {
    console.error('Error al comentar receta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al comentar receta'
    });
  }
};

// Crear versión derivada
exports.crearVersionDerivada = async (req, res) => {
  try {
    const recetaOriginal = await Recipe.findById(req.params.id);

    if (!recetaOriginal) {
      return res.status(404).json({
        success: false,
        message: 'Receta original no encontrada'
      });
    }

    const { titulo, descripcion, ingredientes, pasos, tiempoPreparacion,
            tiempoCoccion, porciones, tipo, dificultad, ocasion } = req.body;

    const versionDerivada = new Recipe({
      titulo: titulo || recetaOriginal.titulo + ' - Mi versión',
      descripcion: descripcion || recetaOriginal.descripcion,
      autor: req.usuario.id,
      ingredientes: ingredientes || recetaOriginal.ingredientes,
      pasos: pasos || recetaOriginal.pasos,
      tiempoPreparacion: tiempoPreparacion || recetaOriginal.tiempoPreparacion,
      tiempoCoccion: tiempoCoccion || recetaOriginal.tiempoCoccion,
      porciones: porciones || recetaOriginal.porciones,
      tipo: tipo || recetaOriginal.tipo,
      dificultad: dificultad || recetaOriginal.dificultad,
      ocasion: ocasion || recetaOriginal.ocasion,
      recetaOriginal: recetaOriginal._id
    });

    await versionDerivada.save();
    await versionDerivada.populate('autor', 'nombre fotoPerfil');
    await versionDerivada.populate('recetaOriginal', 'titulo autor');

    res.status(201).json({
      success: true,
      message: 'Versión derivada creada exitosamente',
      receta: versionDerivada
    });
  } catch (error) {
    console.error('Error al crear versión derivada:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear versión derivada'
    });
  }
};