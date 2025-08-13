const mongoose = require('mongoose')

const MaterielProfSchema = new mongoose.Schema ({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
      },
   
    materiel:{
        type:String,
        required:true
    },
    remarque :
        { type:String,
        required:true},

    schedule: {
        type: Date,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
   
},{timestamps:true})



module.exports=mongoose.model('MaterielProf',MaterielProfSchema)