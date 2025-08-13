const mongoose = require('mongoose');
// Devoir  CC, TP, TD, etc. 

const devoirSchema = new mongoose.Schema({
  classe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classe', 
    required: true,
  },
  professeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  matiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matiere', 
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    //enum: ["CC", "TP", "TD", "Examen","autre"], 
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Devoir', devoirSchema);
