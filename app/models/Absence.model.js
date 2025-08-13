const mongoose = require("mongoose");

const absenceSchema = new mongoose.Schema({
    etudiant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, 
    matiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Matiere",
        required: true
    },
    date: {
      type: Date,  
      required: true
  },
    status: {
        type: String,
        enum: ["Present", "Absent"],
        required: true
    }
}, { timestamps: true });

const Absence = mongoose.model("Absence", absenceSchema);
module.exports = Absence;
