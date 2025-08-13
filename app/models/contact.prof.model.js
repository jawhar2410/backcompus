const mongoose = require('mongoose')

const ContactProfSchema = new mongoose.Schema ({

   
   
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
   
    objet:{
        type:String,
    
        required:true,
    },

    message :{
         type:String,
         required:true,
    },
   
},{timestamps:true})



module.exports=mongoose.model('ContactProf',ContactProfSchema)