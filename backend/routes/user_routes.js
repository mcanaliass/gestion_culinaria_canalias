// backend/routes/user_routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const authMiddleware = require('../middleware/auth_middleware');

// Ruta pública - Perfil público (NO requiere autenticación)
router.get('/perfil-publico/:id', userController.obtenerPerfilPublico);

// Rutas protegidas - Perfil básico
router.get('/perfil', authMiddleware, userController.obtenerPerfil);
router.put('/perfil', authMiddleware, userController.actualizarPerfil);

// Rutas protegidas - Seguridad
router.put('/cambiar-password', authMiddleware, userController.cambiarPassword);
router.put('/cambiar-email', authMiddleware, userController.cambiarEmail);

// Rutas protegidas - Favoritos
router.post('/favoritos/:recetaId', authMiddleware, userController.agregarFavorito);
router.delete('/favoritos/:recetaId', authMiddleware, userController.quitarFavorito);
router.get('/favoritos', authMiddleware, userController.obtenerFavoritos);

module.exports = router;