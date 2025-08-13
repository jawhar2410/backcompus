const mongoose = require("mongoose");

const EvenementSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  lieu: {
    type: String
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  }]
}, { timestamps: true });

const Evenement = mongoose.model("Evenement", EvenementSchema);
module.exports = Evenement;
