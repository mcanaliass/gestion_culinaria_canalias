//backend\models\recipe.js
const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 0
  },
  unidad: {
    type: String,
    required: true,
    enum: ['gramos', 'kilogramos', 'litros', 'mililitros', 'tazas', 'cucharadas', 'cucharaditas', 'unidades', 'pizca']
  },
  costoEstimado: {
    type: Number,
    required: true,
    min: 0
  }
});

const pasoSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 500
  },
  imagen: {
    type: String,
    default: ''
  }
});

const comentarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  texto: {
    type: String,
    required: true,
    maxlength: 500
  },
  imagenResultado: {
    type: String,
    default: ''
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const calificacionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estrellas: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const recipeSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ingredientes: [ingredienteSchema],
  pasos: [pasoSchema],
  tiempoPreparacion: {
    type: Number,
    required: true,
    min: 0
  },
  tiempoCoccion: {
    type: Number,
    required: true,
    min: 0
  },
  porciones: {
    type: Number,
    required: true,
    min: 1
  },
  tipo: {
    type: String,
    required: true,
    enum: ['desayuno', 'almuerzo', 'cena', 'postre', 'botana']
  },
  dificultad: {
    type: String,
    required: true,
    enum: ['facil', 'media', 'dificil']
  },
  ocasion: {
    type: String,
    required: true,
    enum: ['diario', 'especial']
  },
  imagenPrincipal: {
    type: String,
    default: 'default-recipe.jpg'
  },
  costoTotal: {
    type: Number,
    default: 0
  },
  costoPorPorcion: {
    type: Number,
    default: 0
  },
  estado: {
    type: String,
    enum: ['borrador', 'publicada'],
    default: 'publicada'
  },
  recetaOriginal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null
  },
  calificaciones: [calificacionSchema],
  calificacionPromedio: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  comentarios: [comentarioSchema],
  vistas: {
    type: Number,
    default: 0
  },
  vecesGuardada: {
    type: Number,
    default: 0
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaModificacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calcular costo total y por porción antes de guardar
recipeSchema.pre('save', function(next) {
  if (this.ingredientes && this.ingredientes.length > 0) {
    this.costoTotal = this.ingredientes.reduce((total, ing) => {
      return total + (ing.costoEstimado || 0);
    }, 0);
    this.costoTotal = Math.round(this.costoTotal * 100) / 100;
    this.costoPorPorcion = Math.round((this.costoTotal / this.porciones) * 100) / 100;
  }
  
  this.fechaModificacion = Date.now();
  next();
});

// Calcular calificación promedio
recipeSchema.methods.calcularCalificacionPromedio = function() {
  if (this.calificaciones.length === 0) {
    this.calificacionPromedio = 0;
    return;
  }
  
  const suma = this.calificaciones.reduce((total, cal) => total + cal.estrellas, 0);
  this.calificacionPromedio = Math.round((suma / this.calificaciones.length) * 10) / 10;
};

module.exports = mongoose.model('Recipe', recipeSchema);