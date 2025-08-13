const mongoose = require("mongoose");
const { Schema } = mongoose;

const impressionProfSchema = new Schema({

    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User", // Assurez-vous que le modèle "User" est bien défini quelque part dans votre application
    //   required: true,
    // },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    nom_document: {
          type: String,
          required: [true, "Veuillez entrer le nom"],
          maxlength: [100, "Le nom ne doit pas dépasser 100 caractères"],
    },

    responsable:{
      type : String,
      redquired:true,
     },

  remarques: {
        type: String,
        required: [false, "Veuillez entrer les remarques"],
     },

  nombreCopies: {
        type:String,
        required:true,
    },

        schedule: {
                type: Date,
                required: false,
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

module.exports = mongoose.model("ImpressionProf", impressionProfSchema);
