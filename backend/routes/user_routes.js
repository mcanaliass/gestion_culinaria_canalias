const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const authMiddleware = require('../middleware/auth_middleware');

// Rutas protegidas
router.get('/perfil', authMiddleware, userController.obtenerPerfil);
router.put('/perfil', authMiddleware, userController.actualizarPerfil);
router.post('/favoritos/:recetaId', authMiddleware, userController.agregarFavorito);
router.delete('/favoritos/:recetaId', authMiddleware, userController.quitarFavorito);
router.get('/favoritos', authMiddleware, userController.obtenerFavoritos);

module.exports = router;