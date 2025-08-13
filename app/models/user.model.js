const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cin: { type: String, unique: true },
  telephone: { type: String },
  dateNaissance: { type: Date },
  role: {
    type: String,
    enum: ["etudiant", "modScolarite", "prof", "admin"],
    required: true
  },

  // 🔹 Un étudiant a UNE SEULE classe
  classe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classe",
    required: function () { return this.role === "etudiant"; }
  },

  // 🔹 Un professeur peut être dans PLUSIEURS classes
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classe",
    required: function () { return this.role === "prof"; }
  }],
  matiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Matiere",  
    required: false 
  },
  emploi: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Emploi",  
    required: false 
  },
  emploiExamens: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'EmploiExamens', // Correction ici
  required: false,
}
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
