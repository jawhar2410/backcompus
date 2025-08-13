const mongoose = require("mongoose");
const { Schema } = mongoose;

const stageSchema = new Schema({
  title: {
    type: String,
    required: [true, "Veuillez entrer le nom de la stage"],
    maxlength: [100, "Le nom ne doit pas dépasser 100 caractères"],
  },

  description: {
    type: String,
    required: [true, "Veuillez entrer la description de la stage"],
  },

  files: [
    {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true
        },
      },
  ],
});

module.exports = mongoose.model("StageScolarite", stageSchema);
