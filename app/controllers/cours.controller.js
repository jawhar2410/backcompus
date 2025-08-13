const cloudinary = require('cloudinary').v2;
const Cours = require('../models/cours.model');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const config = require('../config/auth.config'); 
const { createNotification } = require ('../controllers/notification.controller')
const Classe = require("../models/Classe.model")
const Notification = require("../models/notification.model")
const mongoose = require('mongoose');

const verifyRole = (token) => {
    try {
        const decodedToken = jwt.verify(token, config.secret);
        if (decodedToken.role !== "modScolarite" && decodedToken.role !== "admin" && decodedToken.role !== "prof") {
            return { authorized: false, message: "Access denied! Only modScolarite or admin can perform this action." };
        }   
        return { authorized: true };
    } catch (err) {
        return { authorized: false, message: "Unauthorized! Invalid token." };
    }   
};


exports.createCours = async (req, res) => {
  try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const roleCheck = verifyRole(token);
      if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
      const decodedToken = jwt.verify(token, config.secret);
      const professeur =decodedToken.id
      const { titre, description, classes } = req.body; // `classes` est un tableau d'IDs de classes
      if (!titre  || !classes ) { 
          return res.status(400).json({ message: "Données manquantes ou invalides" });
      }

      

      let fichierPDF = "";
      if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path, {
              folder: "cours",
              resource_type: "auto"
          });
          fichierPDF = result.secure_url;
          fs.unlinkSync(req.file.path);
      }

      // Créer le cours
      const newCours = await Cours.create({ titre, description, fichierPDF, professeur, classes });

      // Récupérer toutes les classes et accumuler les étudiants
      const classesData = await Classe.find({ _id: { $in: classes } }).populate("etudiants");
      if (!classesData || classesData.length === 0) {
          return res.status(404).json({ message: "Aucune classe trouvée" });
      }

      // Extraire les IDs des étudiants de toutes les classes
      let students = [];
      classesData.forEach(classe => {
          students = students.concat(classe.etudiants.map(etudiant => etudiant._id));
      });

      // Supprimer les doublons (au cas où un étudiant appartient à plusieurs classes)
      students = [...new Set(students)];
      // Créer une notification avec un expéditeur (professeur) et plusieurs destinataires (étudiants des classes)
      const notificationMessage = `Un nouveau cours "${titre}" a été créé par le professeur.`;
      await createNotification(professeur, students, "info", notificationMessage, `/cours/${newCours._id}`);

      res.status(201).json({ success: true, cours: newCours });
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

exports.editCours = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const roleCheck = verifyRole(token);
        if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });

        const { id } = req.params;
        const { titre, description, classes  } = req.body; 
        let fichierPDF = "";

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "cours",
                resource_type: "auto"
            });
            fichierPDF = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const updatedCours = await Cours.findByIdAndUpdate(id, {
            titre,
            description,
            ...(fichierPDF && { fichierPDF }),
            ...(classes && { classes }), // Mise à jour de `classes`
        }, { new: true });

        if (!updatedCours) {
            return res.status(404).json({ message: "Cours introuvable" });
        }

        const coursActuel = await Cours.findById(id);
        if (!coursActuel) {
            return res.status(404).json({ message: "Cours introuvable" });
        }
        const professeur = coursActuel.professeur; // Récupérer l'ID du professeur

         // Récupérer toutes les classes et accumuler les étudiants
      const classesData = await Classe.find({ _id: { $in: classes } }).populate("etudiants");
      if (!classesData || classesData.length === 0) {
          return res.status(404).json({ message: "Aucune classe trouvée" });
      }

      // Extraire les IDs des étudiants de toutes les classes
      let students = [];
      classesData.forEach(classe => {
          students = students.concat(classe.etudiants.map(etudiant => etudiant._id));
      });

      // Supprimer les doublons (au cas où un étudiant appartient à plusieurs classes)
      students = [...new Set(students)];
      // Créer une notification avec un expéditeur (professeur) et plusieurs destinataires (étudiants des classes)
      const notificationMessage = `Le cour "${titre}" a été modifier par le professeur.`;
      await createNotification(professeur, students, "info", notificationMessage, `/cours/${id}`);

        res.status(200).json(updatedCours);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.deleteCours = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const roleCheck = verifyRole(token);
        if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });

        const { id } = req.params;

        // Trouver le cours à supprimer
        const cours = await Cours.findById(id);

        // Vérifier si le cours existe
        if (!cours) {
            return res.status(404).json({ message: "Cours introuvable" });
        }


         // Récupérer les classes et les étudiants associés au cours
         const classesData = await Classe.find({ _id: { $in: cours.classes } }).populate("etudiants");
         if (!classesData || classesData.length === 0) {
             return res.status(404).json({ message: "Aucune classe trouvée" });
         }
 
         // Extraire les IDs des étudiants de toutes les classes
         let students = [];
         classesData.forEach(classe => {
             students = students.concat(classe.etudiants.map(etudiant => etudiant._id));
         });
 
         // Supprimer les doublons (au cas où un étudiant appartient à plusieurs classes)
         students = [...new Set(students)];
 
         // Supprimer les notifications existantes liées au cours
         await Notification.deleteMany({ link: `/cours/${cours._id}` });

         // Envoyer une notification de suppression aux étudiants
         const notificationMessage = `Le cours "${cours.titre}" a été supprimé par le professeur.`;
         await createNotification(cours.professeur, students, "alert", notificationMessage, `/cours/${cours._id}`)

        // Si le cours a un fichier PDF, le supprimer de Cloudinary
        if (cours.fichierPDF) {
            // Extraire l'ID public du fichier PDF
            const publicId = cours.fichierPDF.split('/').pop().split('.')[0];

            // Supprimer le fichier de Cloudinary
            await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        }
      
        // Supprimer le cours de la base de données
        await cours.deleteOne();

        
        // Retourner une réponse de succès
        res.status(200).json({ message: "Cours supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCours = async (req, res) => {
    try {
        const { id } = req.params;
        const cours = await Cours.findById(id).populate('professeur').populate('classes');
        if (!cours) {
            return res.status(404).json({ message: "Cours introuvable" });
        }
        res.status(200).json(cours);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCoursByProfesseur = async (req, res) => {
    try {
        const { professeurId } = req.params;
        const cours = await Cours.find({ professeur: professeurId }).populate('classes');
        res.status(200).json(cours);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCoursByClasse = async (req, res) => {
    try {
        const { classeId } = req.params;
        const cours = await Cours.find({ classes: { $in: [classeId] } }).populate('professeur'); 
        res.status(200).json(cours);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllCours = async (req, res) => {
    try {
        const cours = await Cours.find({}).populate('professeur classes');
        res.status(200).json(cours);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.ajouterCommentaire = async (req, res) => {
    try {
      const { id } = req.params;
      const { texte } = req.body; 
  
      const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, config.secret);
        const userId =decodedToken.id
      if (!userId || !texte) {
        return res.status(400).json({ message: "Données manquantes" });
      }
  
      const commentaireId = new mongoose.Types.ObjectId();

     
      const nouveauCommentaire = {
          _id: commentaireId,
          user: userId,
          texte,
          date: new Date(), 
      }
  
      const cours = await Cours.findByIdAndUpdate(
        id,
        { $push: { commentaires: nouveauCommentaire } }, 
        { new: true }
      ).populate("commentaires.user", "username email"); 
  
      if (!cours) {
        return res.status(404).json({ message: "Cours introuvable" });
      }
      const nom = decodedToken.nom;
      const prenom = decodedToken.prenom;
      const notificationMessage = ` "${nom}" "${prenom}" a été commenté  le cour "${cours.titre}".`;
      await createNotification(userId, cours.professeur, "info", notificationMessage, `/cours/${id}/commentaires/${commentaireId}`);

      res.status(201).json(cours.commentaires);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
///

exports.modifierCommentaire = async (req, res) => {
    try {
      const { id, commentaireId } = req.params; // ID du cours et ID du commentaire
      const { texte } = req.body; // ID de l'utilisateur et nouveau texte
  
      const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, config.secret);
        const userId =decodedToken.id

      if (!userId || !texte) {
        return res.status(400).json({ message: "Données manquantes" });
      }
  
      const cours = await Cours.findOneAndUpdate(
        { _id: id, "commentaires._id": commentaireId, "commentaires.user": userId },
        { $set: { "commentaires.$.texte": texte } }, 
        { new: true }
      ).populate("commentaires.user", "username email");
  
      if (!cours) {
        return res.status(404).json({ message: "Cours, commentaire ou utilisateur introuvable" });
      }
  
      const nom = decodedToken.nom;
      const prenom = decodedToken.prenom;
      const notificationMessage = ` "${nom}" "${prenom}" a modifié le commentiare de cour "${cours.titre}".`;
      await createNotification(userId, cours.professeur, "info", notificationMessage, `/cours/${id}/commentaires/${commentaireId}`);

  

      res.status(200).json(cours.commentaires);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.supprimerCommentaire = async (req, res) => {
    try {
      const { id, commentaireId } = req.params;
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const decodedToken = jwt.verify(token, config.secret);
      const userId =decodedToken.id;
  
      const cours = await Cours.findOneAndUpdate(
        { _id: id, "commentaires._id": commentaireId, "commentaires.user": userId },
        { $pull: { commentaires: { _id: commentaireId } } }, 
        { new: true }
      ).populate("commentaires.user", "username email");
  
      if (!cours) {
        return res.status(404).json({ message: "Cours, commentaire ou utilisateur introuvable" });
      }
  
      const nom = decodedToken.nom;
      const prenom = decodedToken.prenom;

      await Notification.deleteMany({ link: `/cours/${id}/commentaires/${commentaireId}` });

      const notificationMessage = ` "${nom}" "${prenom}" a supprimer le commentiare de cour "${cours.titre}".`;
      await createNotification(userId, cours.professeur, "info", notificationMessage, `/cours/${id}/commentaires/${commentaireId}`);

      

      res.status(200).json(cours.commentaires);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };



  
  exports.repondreCommentaire = async (req, res) => {
    try {
      const { id, commentaireId } = req.params;
      const {  texte } = req.body; 
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const decodedToken = jwt.verify(token, config.secret);
      const userId =decodedToken.id

      if ( !texte) {
        return res.status(400).json({ message: "Données manquantes" });
      }

      const reponseId = new mongoose.Types.ObjectId();

      const nouvelleReponse = {
        _id: reponseId,
        user: userId,
        texte,
        date: new Date(), 
      };
  
      const cours = await Cours.findOneAndUpdate(
        { _id: id, "commentaires._id": commentaireId },
        { $push: { "commentaires.$.reponses": nouvelleReponse } }, 
        { new: true }
      ).populate("commentaires.user commentaires.reponses.user", "username email"); // Récupérer les détails des utilisateurs
  
      if (!cours) {
        return res.status(404).json({ message: "Cours ou commentaire introuvable" });
      }

      
      const commentaire = cours.commentaires.find(c => c._id.toString() === commentaireId);
            if (!commentaire) {
              return res.status(404).json({ message: "Commentaire introuvable" });
            }
      const auteurCommentaireId = commentaire.user._id;      
      const nom = decodedToken.nom;
      const prenom = decodedToken.prenom;
      const notificationMessage = `"${nom}" "${prenom}" a répondu sur le commentaire de ${commentaire.user.email} dans le cours "${cours.titre}".`;
      await createNotification(userId, auteurCommentaireId, "info", notificationMessage, `/cours/${id}/commentaires/${commentaireId}/reponses/${reponseId}`);
  

      res.status(201).json(cours.commentaires);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.modifierReponse = async (req, res) => {
    try {
      const { id, commentaireId, reponseId } = req.params; // ID du cours, du commentaire et de la réponse
      const {  texte } = req.body; // ID de l'utilisateur et nouveau texte
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const decodedToken = jwt.verify(token, config.secret);
      const userId =decodedToken.id

      if ( !texte) {
        return res.status(400).json({ message: "Données manquantes" });
      }
  
      const cours = await Cours.findOneAndUpdate(
        { _id: id, "commentaires._id": commentaireId, "commentaires.reponses._id": reponseId, "commentaires.reponses.user": userId },
        { $set: { "commentaires.$[commentaire].reponses.$[reponse].texte": texte } }, 
        { arrayFilters: [{ "commentaire._id": commentaireId }, { "reponse._id": reponseId }], new: true }
      ).populate("commentaires.user commentaires.reponses.user", "username email");
  
      if (!cours) {
        
        return res.status(404).json({ message: "Cours, commentaire, réponse ou utilisateur introuvable" });
      }
     
      const commentaire = cours.commentaires.find(c => c._id.toString() === commentaireId);
            if (!commentaire) {
              return res.status(404).json({ message: "Commentaire introuvable" });
            }
      const auteurCommentaireId = commentaire.user._id;  
      const nom = decodedToken.nom;
      const prenom = decodedToken.prenom;
      const notificationMessage = `"${nom}" "${prenom}" a modfier le reponse de  commentaire  dans le cours "${cours.titre}".`;
      await createNotification(userId, auteurCommentaireId, "info", notificationMessage, `/cours/${id}/commentaires/${commentaireId}/reponses/${reponseId}`);

      res.status(200).json(cours.commentaires);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.supprimerReponse = async (req, res) => {
    try {
      const { id, commentaireId, reponseId } = req.params; 
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const decodedToken = jwt.verify(token, config.secret);
      const userId =decodedToken.id
  
      const cours = await Cours.findOneAndUpdate(
        { _id: id, "commentaires._id": commentaireId, "commentaires.reponses._id": reponseId, "commentaires.reponses.user": userId },
        { $pull: { "commentaires.$.reponses": { _id: reponseId } } }, // Supprimer la réponse
        { new: true }
      ).populate("commentaires.user commentaires.reponses.user", "username email");
  
      if (!cours) {
        return res.status(404).json({ message: "Cours, commentaire, réponse ou utilisateur introuvable" });
      }
  
      const commentaire = cours.commentaires.find(c => c._id.toString() === commentaireId);
      if (!commentaire) {
        return res.status(404).json({ message: "Commentaire introuvable" });
      }
      const auteurCommentaireId = commentaire.user._id;  
      const nom = decodedToken.nom;
      const prenom = decodedToken.prenom;
      await Notification.deleteMany({ link: `/cours/${cours._id}/commentaires/${commentaireId}/reponses/${reponseId}` });
      const notificationMessage = `"${nom}" "${prenom}" a supprimer le reponse de  commentaire  dans le cours "${cours.titre}".`;
      await createNotification(userId, auteurCommentaireId, "info", notificationMessage, `/cours/${id}/commentaires/${commentaireId}/reponses/${reponseId}`);

      res.status(200).json(cours.commentaires);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };