const mongoose = require("mongoose");

const matiereSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        required: true 
    },
    professeurs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false 
    }],
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classe",
        required: false
    }]
}, { timestamps: true });

const Matiere = mongoose.model("Matiere", matiereSchema);
module.exports = Matiere;
