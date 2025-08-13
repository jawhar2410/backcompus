// attestation.model.js
const mongoose = require("mongoose");

const ReclamationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  reponse: {
    type: String,
    default: "En attente",
  },
  
  type: {
    type: String,
    required: false,
  },

},{ timestamps: true });

module.exports=mongoose.model("Reclamation", ReclamationSchema);


