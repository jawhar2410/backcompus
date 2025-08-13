  const Matiere = require("../models/matiere.model");
  const User = require("../models/user.model");
  const config = require("../config/auth.config");
  const jwt = require("jsonwebtoken");
  const Classe = require("../models/Classe.model");

  // Fonction pour vérifier le rôle
  const verifyRole = (token) => {
      try {
          const decodedToken = jwt.verify(token, config.secret);
          if (decodedToken.role !== "modScolarite" && decodedToken.role !== "admin") {
              return { authorized: false, message: "Access denied! Only modScolarite or admin can perform this action." };
          }   
          return { authorized: true };
      } catch (err) {
          return { authorized: false, message: "Unauthorized! Invalid token." };
      }
  };


  exports.createMatiere = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
          }
          const token = authHeader.split(" ")[1];
          const roleCheck = verifyRole(token);
          if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
      
      const { professeurs,classes, nom } = req.body;

      if ( !nom) {
        return res.status(400).json({ message: "Le nom est requis " });
      }

    let validProfesseurs = [];
  if (professeurs && Array.isArray(professeurs) && professeurs.length === 0 ) {
      // Vérifier si tous les professeurs existent et ont le rôle "prof"
      validProfesseurs = await User.find({ _id: { $in: professeurs }, role: "prof" });

      if (validProfesseurs.length !== professeurs.length) {
        return res.status(400).json({ message: "Certains utilisateurs ne sont pas des professeurs valides." });
      }
    }

          // Vérifier si classes est fourni (sinon, on ne fait pas la vérification)
      let validClasses = [];
      if (classes && Array.isArray(classes) && classes.length > 0) {
        validClasses = await Classe.find({ _id: { $in: classes } });

        if (validClasses.length !== classes.length) {
          return res.status(400).json({ message: "Certaines classes ne sont pas valides." });
        }
      }

          // 🔹 Retirer les professeurs de leurs anciennes matières
          if (professeurs && professeurs.length > 0) {
          await Matiere.updateMany(
              { professeurs: { $in: professeurs } }, // Trouver les matières où ces profs existent
              { $pull: { professeurs: { $in: professeurs } } } // Supprimer ces profs des anciennes matières
            );
          }
      // Créer la nouvelle matière
      const nMatiere = new Matiere({
        professeurs,
        classes,
        nom,
      });

      // Sauvegarder la matière
      await nMatiere.save();

      // Mettre à jour les professeurs pour associer la matière
      if (professeurs && professeurs.length > 0) {

      await User.updateMany(
        { _id: { $in: professeurs } },
        { $set: { matiere: nMatiere._id } }
      );
  }
      // Mettre à jour les classes pour associer la matière
      if (classes && validClasses.length > 0) {
      await Classe.updateMany(
        { _id: { $in: classes } },
        { $addToSet: { matieres: nMatiere._id } }
      );
    }

      res.status(201).json(nMatiere);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la matière :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };

  //update 
  exports.updateMatiere = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const roleCheck = verifyRole(token);
      if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
  
      const { matiereId } = req.params;
      const { professeurs, classes, nom } = req.body;
  
      if (!nom) {
        return res.status(400).json({ message: "Le nom est requis." });
      }
  
      let validProfesseurs = [];
      if (professeurs && Array.isArray(professeurs) && professeurs.length > 0) {
        // Vérifier si tous les professeurs existent et ont le rôle "prof"
        validProfesseurs = await User.find({ _id: { $in: professeurs }, role: "prof" });
  
        if (validProfesseurs.length !== professeurs.length) {
          return res.status(400).json({ message: "Certains utilisateurs ne sont pas des professeurs valides." });
        }
      }
  
      let validClasses = [];
      if (classes && Array.isArray(classes) && classes.length > 0) {
        // Vérifier si toutes les classes existent
        validClasses = await Classe.find({ _id: { $in: classes } });
  
        if (validClasses.length !== classes.length) {
          return res.status(400).json({ message: "Certaines classes ne sont pas valides." });
        }
      }
  
      // Trouver la matière actuelle
      const matiere = await Matiere.findById(matiereId);
      if (!matiere) {
        return res.status(404).json({ message: "Matière non trouvée !" });
      }
  
      // 🔹 Retirer la matière des anciennes classes
      const classesAnciennes = await Classe.find({ matieres: matiere._id });

      if (classesAnciennes.length > 0) {
         
      
          // Mise à jour des classes pour supprimer la matière
          await Classe.updateMany(
              { _id: { $in: classesAnciennes.map(c => c._id) } },
              { $pull: { matieres: matiere._id } }
          );
      
          
      }

  
      // 🔹 Retirer les anciens professeurs de cette matière
      if (matiere.professeurs && matiere.professeurs.length > 0) {
        await User.updateMany(
          { _id: { $in: matiere.professeurs } },
          { $unset: { matiere: "" } } // Supprimer la référence à cette matière
        );
      }
  
      // 🔹 Retirer les nouveaux professeurs de leurs anciennes matières
      if (professeurs && professeurs.length > 0) {
        await Matiere.updateMany(
          { professeurs: { $in: professeurs } },
          { $pull: { professeurs: { $in: professeurs } } }
        );
      }

       
   
  
      // Mettre à jour la matière
      matiere.nom = nom;
      matiere.professeurs = professeurs ; // Garder les anciens professeurs si non fournis
      matiere.classes = classes ; // Garder les anciennes classes si non fournies
      await matiere.save();
  
      // 🔹 Mettre à jour les nouveaux professeurs pour associer cette matière
      if (professeurs && professeurs.length > 0) {
        await User.updateMany(
          { _id: { $in: professeurs } },
          { $set: { matiere: matiere._id } }
        );
      }
  
      // 🔹 Associer la matière aux nouvelles classes
      if (classes && classes.length > 0) {
        await Classe.updateMany(
          { _id: { $in: classes } },
          { $addToSet: { matieres: matiere._id } }
        );
      }
  
      res.status(200).json({ message: "Matière mise à jour avec succès.", matiere });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la matière :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };

  //delete
  exports.deleteMatiere = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const roleCheck = verifyRole(token);
      if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });

      const { matiereId } = req.params;

      // Trouver la matière
      const matiere = await Matiere.findById(matiereId);
      if (!matiere) {
        return res.status(404).json({ message: "Matière non trouvée !" });
      }

   // 🔹 Retirer la matière des anciennes classes
   const classesAnciennes = await Classe.find({ matieres: matiere._id });

   if (classesAnciennes.length > 0) {
      
   
       // Mise à jour des classes pour supprimer la matière
       await Classe.updateMany(
           { _id: { $in: classesAnciennes.map(c => c._id) } },
           { $pull: { matieres: matiere._id } }
       );
   
     
   }

      // 🔹 Retirer la matière des professeurs associés
      if (matiere.professeurs && matiere.professeurs.length > 0) {
        await User.updateMany(
          { _id: { $in: matiere.professeurs } },
          { $unset: { matiere: "" } } // Supprimer la référence à cette matière
        );
      }

      // Supprimer la matière
      await Matiere.findByIdAndDelete(matiereId);

      res.status(200).json({ message: "Matière supprimée avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression de la matière :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  // getbyId
  exports.getMatiereById = async (req, res) => {
    try {
      const { matiereId } = req.params;

      const matiere = await Matiere.findById(matiereId).populate({
        path: "professeurs",
        select: "nom prenom email role", // Sélectionner les champs nécessaires des professeurs
      });

      if (!matiere) {
        return res.status(404).json({ message: "Matière non trouvée !" });
      }

      res.status(200).json(matiere);
    } catch (error) {
      console.error("Erreur lors de la récupération de la matière :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };

  //getall
  exports.getAllMatieres = async (req, res) => {
    try {
      const matieres = await Matiere.find().populate({
        path: "professeurs",
        select: "nom prenom email role", // Sélectionner les champs nécessaires des professeurs
      });

      res.status(200).json(matieres);
    } catch (error) {
      console.error("Erreur lors de la récupération des matières :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };