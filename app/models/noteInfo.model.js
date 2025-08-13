const mongoose = require('mongoose');

const noteInfoSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['Evenement', 'Certification','Annonce'], 
    },  
  
    creationDate: {
        type: Date,
        default: Date.now, 
    },
 
    description: {
        type: String,
        required: true,
    },
    /* 
       status: {
        type: String,
        required: false,
        default:"non lu" ,
        enum: ['non lu', 'lu'], 
    },
    relatedRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        refPath: 'onModel'
    },
    
    onModel: {
        type: String,
        required: true,
        enum: ['Certif','Event','Annonce'] // Modèles associés
    }
    */

},{ timestamps: true });

module.exports = mongoose.model('NoteInfo', noteInfoSchema);
