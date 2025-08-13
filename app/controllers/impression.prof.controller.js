const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const upload = require('../middlewares/fileUpload')
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ImpressionProf = require("../models/impression.prof.model");
const fs = require('fs'); 
const stream = require('stream');
const path = require('path');


// exports.newImpressionProf = catchAsyncErrors(async (req, res, next) => {
//   upload.array('files')(req, res, async function (err) {
//     if (err) {
//       console.error('Erreur lors du téléchargement des fichiers:', err);
//       return res.status(500).json({
//         success: false,
//         message: 'Erreur lors du téléchargement des fichiers'
//       });
//     }

//     let files = [];

//     if (req.files && req.files.length > 0) {
    
//       const uploadPromises = req.files.map((file) => {
//         const fileExtension = path.extname(file.originalname); // Obtenez l'extension du fichier
//         const fileNameWithoutExtension = path.basename(file.originalname, fileExtension); // Obtenez le nom sans l'extension
//         return new Promise((resolve, reject) => {
//           const uploadStream = cloudinary.uploader.upload_stream(
//             {
//               folder: 'impressionProfs',
//               public_id: fileNameWithoutExtension + "_" + Date.now() // Ajoutez un timestamp pour rendre unique
//             },
//             function(error, result) {
//               if (error) {
//                 reject(error);
//               } else {
//                 resolve({
//                   public_id: result.public_id,
//                   url: result.secure_url,
//                   originalname: file.originalname // Conserver le nom original
//                 });
//               }
//             }
//           );
//           const bufferStream = new stream.PassThrough();
//           bufferStream.end(file.buffer);
//           bufferStream.pipe(uploadStream);
//         });
//       });
      

//       try {
//         files = await Promise.all(uploadPromises);
//       } catch (error) {
//         return res.status(500).json({
//           success: false,
//           message: 'Erreur lors de l\'upload à Cloudinary'
//         });
//       }

//       const impressionProf = await ImpressionProf.create({
//         nom_document:req.body.nom_document,
//         responsable:req.body.responsable,
//         remarques:req.body.remarques,
//         nombreCopies:req.body.nombreCopies,
//         schedule:req.body.schedule,
//         files: files
//       });

//       return res.status(201).json({
//         success: true,
//         impressionProf,
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Aucun fichier fourni'
//       });
//     }
//   });
// });
exports.newImpressionProf = catchAsyncErrors(async (req, res, next) => {
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
        const fileExtension = path.extname(file.originalname);
        const fileNameWithoutExtension = path.basename(file.originalname, fileExtension);
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'impressionProfs',
              public_id: fileNameWithoutExtension + "_" + Date.now()
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  public_id: result.public_id,
                  url: result.secure_url
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
    }

    // Utilisation de req.userId pour obtenir l'ID de l'utilisateur actuellement connecté
    const userId = req.userId; // Assurez-vous que verifyToken est appliqué dans la route

    const { nom_document, remarques, responsable,nombreCopies, schedule } = req.body;
    const impressionProf = await ImpressionProf.create({
      user: userId, // Utilisation de l'ID de l'utilisateur
      nom_document,
      responsable, 
      remarques,
      nombreCopies,
      schedule,
      files
    });

    return res.status(201).json({
      success: true,
      impressionProf,
    });
  });
});


exports.getAllImpressionProfs = catchAsyncErrors(async (req, res, next) => {
  const impressionProf = await ImpressionProf.find();
  res.status(200).json({
    success: true,
    count: impressionProf.length,
    data: impressionProf
  });
});


exports.getImpressionProfById = catchAsyncErrors(async (req, res, next) => {
  const impressionProf = await ImpressionProf.findById(req.params.id);
  
  if (!impressionProf) {
    return res.status(404).json({
      success: false,
      message: 'ImpressionProf non trouvé'
    });
  }
  
  res.status(200).json({
    success: true,
    data: impressionProf
  });
});


exports.updateImpressionProf = catchAsyncErrors(async (req, res, next) => {
  let impressionProf = await ImpressionProf.findById(req.params.id);

  if (!impressionProf) {
    return res.status(404).json({
      success: false,
      message: 'ImpressionProf non trouvé'
    });
  }

  impressionProf = await ImpressionProf.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: impressionProf
  });
});

exports.deleteImpressionProf = catchAsyncErrors(async (req, res, next) => {
  const impressionProf = await ImpressionProf.findById(req.params.id);

  if (!impressionProf) {
    return res.status(404).json({
      success: false,
      message: 'ImpressionProf non trouvé'
    });
  }

  // Suppression des fichiers sur Cloudinary
  if (impressionProf.files && impressionProf.files.length > 0) {
    // Utilisez Promise.all pour traiter la suppression de plusieurs fichiers en parallèle
    const deletePromises = impressionProf.files.map((file) =>
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

  // Suppression du impressionProf de la base de données après la suppression des fichiers
  await impressionProf.remove();

  res.status(200).json({
    success: true,
    message: 'ImpressionProf et fichiers associés supprimés'
  });
});

// exports.getAllImpressionProfsByUser = catchAsyncErrors(async (req, res) => {
//   try {
//     const { userId } = req.params;
//     // Remplacez `user` par le champ correct dans le schéma de ImpressionProf si différent.
//     const impressionProfs = await ImpressionProf.find({ responsable: userId });

//     res.status(200).json({
//       success: true,
//       count: impressionProfs.length,
//       data: impressionProfs
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

exports.getImpressionsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const impressions = await ImpressionProf.find({ user: userId }); // ou les champs que vous souhaitez inclure
    res.status(200).json(impressions);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
