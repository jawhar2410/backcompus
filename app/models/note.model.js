const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
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
  note: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },

}, { timestamps: true });

const Note = mongoose.model("Note", NoteSchema);
module.exports = Note;
