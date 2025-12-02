const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un correo válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener mínimo 8 caracteres']
  },
  rol: {
    type: String,
    enum: ['usuario', 'chef', 'administrador'],
    default: 'usuario'
  },
  biografia: {
    type: String,
    maxlength: [500, 'La biografía no puede exceder 500 caracteres'],
    default: ''
  },
  fotoPerfil: {
    type: String,
    default: 'default-avatar.png'
  },
  preferenciasDieteticas: [{
    type: String,
    enum: ['vegetariano', 'vegano', 'sin-gluten', 'sin-lactosa', 'ninguna']
  }],
  recetasFavoritas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  seguidores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  siguiendo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('User', userSchema);