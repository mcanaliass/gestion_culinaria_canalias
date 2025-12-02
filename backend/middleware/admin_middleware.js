// backend/middleware/admin_middleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario sea administrador
    if (decoded.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo los administradores pueden realizar esta acción'
      });
    }

    req.usuario = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado. Por favor inicia sesión nuevamente'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};