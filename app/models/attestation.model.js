// attestation.model.js
const mongoose = require("mongoose");

const AttestationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  matricule: {
    type: String,
    required: true,
  },
  cin: {
    type: String,
    required: true,
  },
  raison: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    default: "En attente",
  },

  updatedAt: {
    type: Date,
    default: Date.now,
 },
});

module.exports=mongoose.model("Attestation", AttestationSchema);


