const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipe_controller');
const authMiddleware = require('../middleware/auth_middleware');

// Rutas públicas
router.get('/', recipeController.obtenerRecetas);
router.get('/buscar', recipeController.buscarRecetas);
router.get('/:id', recipeController.obtenerRecetaPorId);

// Rutas protegidas (requieren autenticación)
router.post('/', authMiddleware, recipeController.crearReceta);
router.put('/:id', authMiddleware, recipeController.editarReceta);
router.delete('/:id', authMiddleware, recipeController.eliminarReceta);
router.post('/:id/calificar', authMiddleware, recipeController.calificarReceta);
router.post('/:id/comentar', authMiddleware, recipeController.comentarReceta);
router.post('/:id/version-derivada', authMiddleware, recipeController.crearVersionDerivada);

module.exports = router;