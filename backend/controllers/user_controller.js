const User = require('../models/user');
const Recipe = require('../models/recipe');

// Obtener perfil de usuario
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id)
      .select('-password')
      .populate('recetasFavoritas', 'titulo imagenPrincipal calificacionPromedio');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener recetas creadas por el usuario
    const recetasCreadas = await Recipe.find({ autor: req.usuario.id })
      .select('titulo imagenPrincipal calificacionPromedio vistas');

    res.json({
      success: true,
      usuario,
      recetasCreadas
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
};

// Actualizar perfil
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, biografia, preferenciasDieteticas } = req.body;
    
    const usuario = await User.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos
    if (nombre) usuario.nombre = nombre;
    if (biografia !== undefined) usuario.biografia = biografia;
    if (preferenciasDieteticas) usuario.preferenciasDieteticas = preferenciasDieteticas;

    await usuario.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        biografia: usuario.biografia,
        preferenciasDieteticas: usuario.preferenciasDieteticas
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
};

// Agregar receta a favoritos
exports.agregarFavorito = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id);
    const receta = await Recipe.findById(req.params.recetaId);

    if (!receta) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    // Verificar si ya está en favoritos
    if (usuario.recetasFavoritas.includes(req.params.recetaId)) {
      return res.status(400).json({
        success: false,
        message: 'La receta ya está en favoritos'
      });
    }

    usuario.recetasFavoritas.push(req.params.recetaId);
    receta.vecesGuardada += 1;

    await usuario.save();
    await receta.save();

    res.json({
      success: true,
      message: 'Receta agregada a favoritos'
    });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar favorito'
    });
  }
};

// Quitar receta de favoritos
exports.quitarFavorito = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id);
    const receta = await Recipe.findById(req.params.recetaId);

    if (!receta) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }

    usuario.recetasFavoritas = usuario.recetasFavoritas.filter(
      id => id.toString() !== req.params.recetaId
    );
    
    if (receta.vecesGuardada > 0) {
      receta.vecesGuardada -= 1;
    }

    await usuario.save();
    await receta.save();

    res.json({
      success: true,
      message: 'Receta quitada de favoritos'
    });
  } catch (error) {
    console.error('Error al quitar favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al quitar favorito'
    });
  }
};

// Obtener recetas favoritas
exports.obtenerFavoritos = async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario.id)
      .populate({
        path: 'recetasFavoritas',
        populate: { path: 'autor', select: 'nombre fotoPerfil' }
      });

    res.json({
      success: true,
      favoritos: usuario.recetasFavoritas
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener favoritos'
    });
  }
};