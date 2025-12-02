// backend/controllers/admin_controller.js
const User = require('../models/user');

// Crear nuevo administrador (solo admins pueden crear admins)
exports.crearAdministrador = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar datos obligatorios
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona nombre, correo y contraseña'
      });
    }

    // Validar formato de email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa un correo electrónico válido'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener mínimo 8 caracteres'
      });
    }

    // Validar que la contraseña tenga mayúscula, minúscula y número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Crear nuevo administrador
    const nuevoAdmin = new User({
      nombre,
      email,
      password,
      rol: 'administrador'
    });

    await nuevoAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      usuario: {
        id: nuevoAdmin._id,
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
        rol: nuevoAdmin.rol
      }
    });

  } catch (error) {
    console.error('Error al crear administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear administrador'
    });
  }
};

// Obtener lista de todos los usuarios (solo para admins)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find()
      .select('-password')
      .sort({ fechaRegistro: -1 });

    res.json({
      success: true,
      cantidad: usuarios.length,
      usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// Obtener estadísticas del sistema
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const Recipe = require('../models/recipe');

    const totalUsuarios = await User.countDocuments();
    const totalChefs = await User.countDocuments({ rol: 'chef' });
    const totalAdmins = await User.countDocuments({ rol: 'administrador' });
    const totalRecetas = await Recipe.countDocuments();
    const recetasPublicadas = await Recipe.countDocuments({ estado: 'publicada' });

    res.json({
      success: true,
      estadisticas: {
        totalUsuarios,
        totalChefs,
        totalAdmins,
        totalRecetas,
        recetasPublicadas
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};