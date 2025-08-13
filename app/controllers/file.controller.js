const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Test = require("../models/file.model");
const fs = require('fs'); 
const stream = require('stream');
const path = require('path');


exports.newTest = catchAsyncErrors(async (req, res, next) => {
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
              folder: 'tests',
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

      const test = await Test.create({
        title: req.body.title,
        description: req.body.description,
        files: files
      });

      return res.status(201).json({
        success: true,
        test,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }
  });
});


exports.getAllTests = catchAsyncErrors(async (req, res, next) => {
  const tests = await Test.find();
  res.status(200).json({
    success: true,
    count: tests.length,
    data: tests
  });
});


exports.getTestById = catchAsyncErrors(async (req, res, next) => {
  const test = await Test.findById(req.params.id);
  
  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Test non trouvé'
    });
  }
  
  res.status(200).json({
    success: true,
    data: test
  });
});


exports.updateTest = catchAsyncErrors(async (req, res, next) => {
  let test = await Test.findById(req.params.id);

  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Test non trouvé'
    });
  }

  test = await Test.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: test
  });
});

exports.deleteTest = catchAsyncErrors(async (req, res, next) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    return res.status(404).json({
      success: false,
      message: 'Test non trouvé'
    });
  }

  // Suppression des fichiers sur Cloudinary
  if (test.files && test.files.length > 0) {
    // Utilisez Promise.all pour traiter la suppression de plusieurs fichiers en parallèle
    const deletePromises = test.files.map((file) =>
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

  // Suppression du test de la base de données après la suppression des fichiers
  await test.remove();

  res.status(200).json({
    success: true,
    message: 'Test et fichiers associés supprimés'
  });
});



//2nd variation for new request mokles
    // const uploadPromises = req.files.map((file) => {
      //   return new Promise((resolve, reject) => {
      //     const uploadStream = cloudinary.uploader.upload_stream({ folder: 'tests' }, function(error, result) {
      //       if (error) {
      //         reject(error);
      //       } else {
      //         resolve({
      //           public_id: result.public_id,
      //           url: result.secure_url
      //         });
      //       }
      //     });
      //     const bufferStream = new stream.PassThrough();
      //     bufferStream.end(file.buffer);
      //     bufferStream.pipe(uploadStream);
      //   });
      // });