const mongoose = require("mongoose");
const { Schema } = mongoose;

const testSchema = new Schema({
  title: {
    type: String,
    required: [true, "Veuillez entrer le nom de la test"],
    maxlength: [100, "Le nom ne doit pas dépasser 100 caractères"],
  },

  description: {
    type: String,
    required: [true, "Veuillez entrer la description de la test"],
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

module.exports = mongoose.model("Test", testSchema);
