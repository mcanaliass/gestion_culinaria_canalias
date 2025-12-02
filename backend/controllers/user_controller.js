// backend/controllers/user_controller.js
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

// Actualizar perfil (ACTUALIZADO según RF-003)
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

    // Actualizar campos permitidos según RF-003
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
        preferenciasDieteticas: usuario.preferenciasDieteticas,
        fotoPerfil: usuario.fotoPerfil
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

// NUEVO: Cambiar contraseña (buena práctica de seguridad)
exports.cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    // Validar datos
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar la contraseña actual y la nueva'
      });
    }

    // Validar longitud de contraseña nueva
    if (passwordNueva.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña nueva debe tener mínimo 8 caracteres'
      });
    }

    // Validar formato de contraseña nueva
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(passwordNueva)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      });
    }

    const usuario = await User.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const passwordCorrecta = await usuario.compararPassword(passwordActual);
    if (!passwordCorrecta) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    usuario.password = passwordNueva;
    await usuario.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
};

// NUEVO: Cambiar email (buena práctica de usabilidad)
exports.cambiarEmail = async (req, res) => {
  try {
    const { nuevoEmail, password } = req.body;

    // Validar datos
    if (!nuevoEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Debes proporcionar el nuevo email y tu contraseña'
      });
    }

    // Validar formato de email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(nuevoEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa un correo electrónico válido'
      });
    }

    const usuario = await User.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña
    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    // Verificar que el nuevo email no esté en uso
    const emailExistente = await User.findOne({ email: nuevoEmail });
    if (emailExistente) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está en uso'
      });
    }

    // Actualizar email
    usuario.email = nuevoEmail;
    await usuario.save();

    res.json({
      success: true,
      message: 'Correo electrónico actualizado exitosamente',
      nuevoEmail: usuario.email
    });

  } catch (error) {
    console.error('Error al cambiar email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar correo electrónico'
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

//Obtener perfil público de un usuario
exports.obtenerPerfilPublico = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar usuario sin información sensible
    const usuario = await User.findById(id)
      .select('nombre email rol biografia fotoPerfil preferenciasDieteticas fechaRegistro');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Buscar recetas publicadas del usuario
    const recetas = await Recipe.find({ 
      autor: id,
      estado: 'publicada' 
    })
      .select('titulo descripcion imagenPrincipal calificacionPromedio vistas tiempoPreparacion tiempoCoccion porciones dificultad tipo fechaCreacion')
      .sort({ fechaCreacion: -1 });

    // Calcular estadísticas
    const totalVistas = recetas.reduce((sum, receta) => sum + (receta.vistas || 0), 0);
    const totalRecetas = recetas.length;

    res.json({
      success: true,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        biografia: usuario.biografia,
        fotoPerfil: usuario.fotoPerfil,
        preferenciasDieteticas: usuario.preferenciasDieteticas,
        fechaRegistro: usuario.fechaRegistro,
        estadisticas: {
          totalRecetas,
          totalVistas
        }
      },
      recetas
    });

  } catch (error) {
    console.error('Error al obtener perfil público:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil público'
    });
  }
};