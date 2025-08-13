const mongoose = require("mongoose");

const commentaireSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  texte: {
    type: String,
    required: true,
  },
  reponses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    texte: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  date: {
    type: Date,
    default: Date.now,
  },
});

const coursSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  fichierPDF: {
    type: String, 
    required: true,
  },
  professeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  classes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Classe",
    required: true,
  },
  commentaires: [commentaireSchema],
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Cours = mongoose.model("Cours", coursSchema);
module.exports = Cours;