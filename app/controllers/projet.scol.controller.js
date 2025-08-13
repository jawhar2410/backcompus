const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Projet = require("../models/projet.scol.model");
const fs = require('fs'); 
const stream = require('stream');
const path = require('path');




exports.newProjet = catchAsyncErrors(async (req, res, next) => {
    upload.array('files')(req, res, async function (err) {
      if (err) {
        console.error('Erreur lors du téléchargement des fichiers:', err);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors du téléchargement des fichiers'
        });
      }
  
      let files = [];
  
      if (req.files && req.files.length > 0) {
      
        const uploadPromises = req.files.map((file) => {
          const fileExtension = path.extname(file.originalname); // Obtenez l'extension du fichier
          const fileNameWithoutExtension = path.basename(file.originalname, fileExtension); // Obtenez le nom sans l'extension
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'projets',
                public_id: fileNameWithoutExtension + "_" + Date.now() // Ajoutez un timestamp pour rendre unique
              },
              function(error, result) {
                if (error) {
                  reject(error);
                } else {
                  resolve({
                    public_id: result.public_id,
                    url: result.secure_url,
                    originalname: file.originalname // Conserver le nom original
                  });
                }
              }
            );
            const bufferStream = new stream.PassThrough();
            bufferStream.end(file.buffer);
            bufferStream.pipe(uploadStream);
          });
        });
        
  
        try {
          files = await Promise.all(uploadPromises);
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'upload à Cloudinary'
          });
        }
  
        const projet = await Projet.create({
          title: req.body.title,
          description: req.body.description,
          files: files
        });
  
        return res.status(201).json({
          success: true,
          projet,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
      }
    });
  });

exports.getAllProjets = catchAsyncErrors(async (req, res, next) => {
  const projets = await Projet.find();
  res.status(200).json({
    success: true,
    count: projets.length,
    data: projets
  });
});


exports.getProjetById = catchAsyncErrors(async (req, res, next) => {
  const projet = await Projet.findById(req.params.id);
  
  if (!projet) {
    return res.status(404).json({
      success: false,
      message: 'Projet non trouvé'
    });
  }
  
  res.status(200).json({
    success: true,
    data: projet
  });
});


exports.updateProjet = catchAsyncErrors(async (req, res, next) => {
  let projet = await Projet.findById(req.params.id);

  if (!projet) {
    return res.status(404).json({
      success: false,
      message: 'Projet non trouvé'
    });
  }

  projet = await Projet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: projet
  });
});

exports.deleteProjet = catchAsyncErrors(async (req, res, next) => {
  const projet = await Projet.findById(req.params.id);

  if (!projet) {
    return res.status(404).json({
      success: false,
      message: 'Projet non trouvé'
    });
  }

  // Suppression des fichiers sur Cloudinary
  if (projet.files && projet.files.length > 0) {
    // Utilisez Promise.all pour traiter la suppression de plusieurs fichiers en parallèle
    const deletePromises = projet.files.map((file) =>
      cloudinary.uploader.destroy(file.public_id)
    );

    try {
      // Attendre la suppression de tous les fichiers
      await Promise.all(deletePromises);
    } catch (error) {
    
     
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression des fichiers sur Cloudinary'
      });
    }
  }

  // Suppression du projet de la base de données après la suppression des fichiers
  await projet.remove();

  res.status(200).json({
    success: true,
    message: 'Projet et fichiers associés supprimés'
  });
});

