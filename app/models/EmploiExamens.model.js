const mongoose = require('mongoose');

const emploiExamensSchema = new mongoose.Schema({
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
  jour: {
    type: String,
    enum: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"], 
    required: true,
  },
  horaire: {
    type: String,
    required: true, // Exemple : "8h/10h"
  },
}, { timestamps: true });

module.exports = mongoose.model('EmploiExamens', emploiExamensSchema);