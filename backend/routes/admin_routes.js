// backend/routes/admin_routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_controller');
const adminMiddleware = require('../middleware/admin_middleware');

// Todas las rutas requieren autenticación de administrador
router.post('/crear-admin', adminMiddleware, adminController.crearAdministrador);
router.get('/usuarios', adminMiddleware, adminController.obtenerUsuarios);
router.get('/estadisticas', adminMiddleware, adminController.obtenerEstadisticas);

module.exports = router;