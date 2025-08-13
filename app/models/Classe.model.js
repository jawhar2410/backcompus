const mongoose = require("mongoose");

const classeSchema = new mongoose.Schema({
    nom: { type: String, required: true },  // Nom de la classe (ex: "1ère année A")
    specialiteNiveau: { type: String },  // Licence, Master, etc.
    specialiteDomaine: { type: String },  // Informatique, Finance, etc.
    groupe: { type: String },  // Groupe spécifique (ex: Groupe 1, Groupe 2)
    anneeScolaire: { type: String, required: true },  // Ex: "2024-2025"

  
    professeurs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    
    etudiants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

 emploi: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Emploi',
  required: false,
},

matieres: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Matiere" ,
  required: false 
}],
  emploiExamens: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'EmploiExamens', 
  required: false,
}

}, { timestamps: true });

const Classe = mongoose.model('Classe', classeSchema);
module.exports = Classe;
