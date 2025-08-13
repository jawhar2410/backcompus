const EmploiExamens =require('../models/EmploiExamens.model'); 
const Classe = require('../models/Classe.model');
const jwt = require("jsonwebtoken");
const config = require('../config/auth.config'); 
const User = require("../models/user.model");
const Matiere = require("../models/matiere.model");
const mongoose = require("mongoose");

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

// Créer un emploi
exports.createEmploi = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const roleCheck = verifyRole(token);
      if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
     const decodedToken = jwt.verify(token, config.secret);
        const userId =decodedToken.id 

      const { classe,   jour, horaire } = req.body;
  
      // Vérifier que les IDs de classe, professeur et matière existent
      const classeExists = await Classe.findById(classe);
      const professeurExists = await User.findById(userId);
     
  
      if (!classeExists ) {
        return res.status(400).json({ message: "Classe non trouvé(e) !" });
      }
      
      if (!professeurExists) {
        return res.status(400).json({ message: " professeur  non trouvé(e) !" });
      }
      
      // Vérifier que le professeur a bien le rôle "prof"
      if (professeurExists.role !== "prof") {
        return res.status(400).json({ message: "L'utilisateur n'est pas un professeur valide." });
      }

      if (!professeurExists.matiere ) {
        return res.status(400).json({ message: "Le professeur n'a pas de matière assignée." });
      }
 
      const matiere = professeurExists.matiere;
  
      // Vérifier que le jour est valide
      const joursValides = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
      if (!joursValides.includes(jour)) {
        return res.status(400).json({ message: "Jour invalide !" });
      }
  
      // Vérifier que l'horaire est valide (exemple : "8h/10h")
      if (!horaire || typeof horaire !== "string") {
        return res.status(400).json({ message: "Horaire invalide !" });
      }
  
      // Créer l'emploi du temps
      const newEmploiExamens = new EmploiExamens({
        classe,
        userId,
        matiere,
        jour,
        horaire,
      });
  
      await newEmploiExamens.save();
  
      res.status(201).json({ message: "Emploi du temps créé avec succès.", emploiExamens: newEmploiExamens });
    } catch (error) {
      console.error("Erreur lors de la création de l'emploi du temps :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };

// Mettre à jour un emploi
exports.updateEmploi = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
      const token = authHeader.split(" ")[1];
      const roleCheck = verifyRole(token);
      if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
      const decodedToken = jwt.verify(token, config.secret);
      const userId =decodedToken.id 
      
      const { emploiId } = req.params;
      const { classe,  jour, horaire } = req.body;
  
      // Trouver l'emploi du temps existant
      const emploi = await EmploiExamens.findById(emploiId);
      if (!emploi) {
        return res.status(404).json({ message: "Emploi du temps non trouvé !" });
      }
  
      // Vérifier que les IDs de classe, professeur et matière existent (si fournis)
      if (classe) {
        const classeExists = await Classe.findById(classe);
        if (!classeExists) {
          return res.status(400).json({ message: "Classe non trouvée !" });
        }
        emploi.classe = classe;
      }
  
    
      if (userId) {
        const professeurExists = await User.findById(userId);
        if (!professeurExists || professeurExists.role !== "prof") {
          return res.status(400).json({ message: "Professeur non trouvé ou invalide !" });
        }
        emploi.professeur = userId;
  
        // Vérifier si le professeur a une matière assignée
        if (!professeurExists.matiere) {
          return res.status(400).json({ message: "Le professeur n'a pas de matière assignée." });
        }
  
        // Vérifier que la matière existe dans la base de données
        const matiereExists = await Matiere.findById(professeurExists.matiere);
        if (!matiereExists) {
          return res.status(400).json({ message: "La matière assignée au professeur n'existe pas." });
        }
  
        // Assigner la matière à l'emploi du temps
        emploi.matiere = professeurExists.matiere;
      }
  
  
      // Vérifier que le jour est valide (si fourni)
      if (jour) {
        const joursValides = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        if (!joursValides.includes(jour)) {
          return res.status(400).json({ message: "Jour invalide !" });
        }
        emploi.jour = jour;
      }
  
      // Vérifier que l'horaire est valide (si fourni)
      if (horaire) {
        if (typeof horaire !== "string") {
          return res.status(400).json({ message: "Horaire invalide !" });
        }
        emploi.horaire = horaire;
      }
  
      // Sauvegarder les modifications
      await emploi.save();
  
      res.status(200).json({ message: "Emploi du temps mis à jour avec succès.", emploi });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'emploi du temps :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };

// Supprimer un emploi
exports.deleteEmploi = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const roleCheck = verifyRole(token);
        if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });

        const { emploiId } = req.params;

        const emploi = await EmploiExamens.findByIdAndDelete(emploiId);
        if (!emploi) return res.status(404).send({ message: "Emploi not found!" });

        

        res.status(200).json({ message: "Emploi supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir tous les emplois
exports.getAllEmplois = async (req, res) => {
    try {
        const emplois = await EmploiExamens.find().populate("classe");
        res.status(200).json(emplois);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
///// get emploi by classe
exports.getEmploiByclasse = async (req, res) => {
    try {
        
        const {classeId} = req.params
        const classe = await Classe.findById(classeId)
        if ( !classe ) return res.status(404).send({message : "classe non valide"})
         const emplois = await EmploiExamens.find({classe :classeId }).populate('matiere' , 'id nom ').populate('classe' , 'id nom ').populate('professeur' , 'id nom prenom');
        
        res.status(200).json(emplois); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//// get emploi by id prof
        exports.getEmploiByprof = async (req , res ) => {
        try {
        const {profId} = req.params 
        const prof = await User.findById(profId)
        if (!prof) return res.status(404).send({message :"prof non valide"})

        if (prof.role !== 'prof') return res.status(401).send({message :'le role de use n est pas prof'})
          
        const emplois = await EmploiExamens.find({professeur :profId})
        .populate('matiere' , 'id nom ').populate('classe' , 'id nom ').
        populate('professeur' , 'id nom prenom')
          
        res.status(200).json(emplois)
        }catch (error){
          res.status(500).json({ message: error.message });
        }
        }
//// get emploi with token 

exports.getEmploiUser = async (req, res) => {
  try {
   
const authHeader = req.headers["authorization"];
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
}
const token = authHeader.split(" ")[1];
const decodedToken = jwt.verify(token, config.secret);
const userId = decodedToken.id || decodedToken._id;

//console.log("userId:", userId);


const user = await User.findById(userId)
if (!user) return res.status(404).send({message :"prof non valide"})


  
    if (!user.classe) {
      return res.status(400).json({ message: "Cet utilisateur n'a pas de classe assignée." });
    }

    const classeId = user.classe; 


    if (!mongoose.Types.ObjectId.isValid(classeId)) {
      return res.status(400).json({ message: "ID de classe invalide." });
    }

    // Vérifier que la classe existe
    const classe = await Classe.findById(classeId);
    if (!classe) {
      return res.status(404).json({ message: "Classe non trouvée !" });
    }


    // Récupérer les emplois du temps de la classe
    const emplois = await EmploiExamens.find({ classe: classeId })
      .populate("matiere", "nom") // Populer la matière avec le champ 'nom'
      .populate("professeur", "nom prenom"); // Populer le professeur avec les champs 'nom' et 'prenom'



    // Vérifier si des emplois ont été trouvés
    if (emplois.length === 0) {
      return res.status(404).json({ message: "Aucun emploi trouvé pour cette classe." });
    }

    res.status(200).json(emplois);
  } catch (error) {
    console.error("Erreur détaillée :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 
exports.getEmploiById = async (req, res) => {
    try {
        const { emploiId } = req.params;
        const emploi = await EmploiExamens.findById(emploiId).populate("classe");
        if (!emploi) return res.status(404).send({ message: "Emploi not found!" });

        res.status(200).json(emploi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  

///

exports.Emploichek = async (req , res ) => {
  try {
    const authHeader = req.headers["authorization"];
if (!authHeader || !authHeader.startsWith("Bearer ")) {
return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
}
const token = authHeader.split(" ")[1];
const decodedToken = jwt.verify(token, config.secret);
const userId = decodedToken.id || decodedToken._id;

const {classe} = req.params
const classeExists = await Classe.findById(classe);
    if (!classeExists ){return res.status(400).json({message: "Classe non trouvé(e) !" })}

// Récupérer toutes les classes et accumuler les étudiants
const classesData = await Classe.find().populate("etudiants");
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



const notificationMessage = `"votre emploi est disponible.`;
    await createNotification(userId, students, "info", notificationMessage, `/emploi/${classe}`);
  } catch (error) {

  }
};