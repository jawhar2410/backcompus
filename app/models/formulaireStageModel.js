
const mongoose = require('mongoose');

const formulaireStageSchema = new mongoose.Schema({
  // Définis les champs nécessaires pour le formulaire de stage
  nom:{ type: String, required: true },
  prenom:{ type: String, required: true },
  Matricule:{ type: String, required: true },
  dateNaissance :{ type: Date, required: true },
  email: { type: String , unique: true },
  description:{ type: String, required: true },
  

  


});

module.exports = mongoose.model('FormulaireStage', formulaireStageSchema);


