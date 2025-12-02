const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth_controller');

// Registro de usuario
router.post('/registro', authController.registrarUsuario);

// Inicio de sesión
router.post('/login', authController.iniciarSesion);

// Cerrar sesión
router.post('/logout', authController.cerrarSesion);

module.exports = router;