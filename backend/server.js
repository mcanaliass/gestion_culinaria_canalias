const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((error) => console.error('Error de conexión a MongoDB:', error));

// Importar rutas
const authRoutes = require('./routes/auth_routes');
const recipeRoutes = require('./routes/recipe_routes');
const userRoutes = require('./routes/user_routes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

// Ruta raíz - redirige al frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor' 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});