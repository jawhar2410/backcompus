
// module.exports = upload;
const multer = require('multer');
const path = require('path');

// Définition du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/back/public/upload'));
    // cb(null, path.join(__dirname, '../../public/upload'));
  },
  filename: function(req, file, cb) {
    // Nom du fichier : timestamp-nomOrigine.extension
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filtrer les fichiers pour accepter uniquement les PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accepter le fichier
  } else {
    cb(new Error('Type de fichier non supporté.',400), false); // Rejeter le fichier
  }
};


const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limite de taille du fichier à 5MB
  }
});
module.exports = upload;