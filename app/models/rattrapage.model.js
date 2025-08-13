const mongoose = require("mongoose");

const RattrapageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assurez-vous que le modèle "User" est bien défini quelque part dans votre application
    required: true,
  },
  matiere: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reponse: {
    type: String,
    default: "En attente",// Mettez à true si la réponse est obligatoire
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Rattrapage", RattrapageSchema);
