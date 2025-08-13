const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Stage = require("../models/stage.scol.model");
const fs = require('fs'); 
const stream = require('stream');





exports.newStage = catchAsyncErrors(async (req, res, next) => {
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
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({ folder: 'stages' }, function(error, result) {
            if (error) {
              reject(error);
            } else {
              resolve({
                public_id: result.public_id,
                url: result.secure_url
              });
            }
          });
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

      const stage = await Stage.create({
        title: req.body.title,
        description: req.body.description,
        files: files
      });

      return res.status(201).json({
        success: true,
        stage,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
  });
});


exports.getAllStages = catchAsyncErrors(async (req, res, next) => {
  const stages = await Stage.find();
  res.status(200).json({
    success: true,
    count: stages.length,
    data: stages
  });
});


exports.getStageById = catchAsyncErrors(async (req, res, next) => {
  const stage = await Stage.findById(req.params.id);
  
  if (!stage) {
    return res.status(404).json({
      success: false,
      message: 'Stage non trouvé'
    });
  }
  
  res.status(200).json({
    success: true,
    data: stage
  });
});


exports.updateStage = catchAsyncErrors(async (req, res, next) => {
  let stage = await Stage.findById(req.params.id);

  if (!stage) {
    return res.status(404).json({
      success: false,
      message: 'Stage non trouvé'
    });
  }

  stage = await Stage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: stage
  });
});

exports.deleteStage = catchAsyncErrors(async (req, res, next) => {
  const stage = await Stage.findById(req.params.id);

  if (!stage) {
    return res.status(404).json({
      success: false,
      message: 'Stage non trouvé'
    });
  }

  // Suppression des fichiers sur Cloudinary
  if (stage.files && stage.files.length > 0) {
    // Utilisez Promise.all pour traiter la suppression de plusieurs fichiers en parallèle
    const deletePromises = stage.files.map((file) =>
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

  // Suppression du stage de la base de données après la suppression des fichiers
  await stage.remove();

  res.status(200).json({
    success: true,
    message: 'Stage et fichiers associés supprimés'
  });
});

