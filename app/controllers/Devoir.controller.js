const jwt = require("jsonwebtoken");
const config = require('../config/auth.config');
const Devoir = require("../models/Devoir.model");
const Classe = require("../models/Classe.model");
const User = require("../models/user.model");
const Matiere = require("../models/matiere.model");
const mongoose = require("mongoose");
const { createNotification } = require ('../controllers/notification.controller');
const notificationModel = require("../models/notification.model");


// Fonction pour vérifier le rôle
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


exports.CreateDevoir = async (req , res ) => {
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
    const {classe , date , type } = req.body;
    
        // Vérifier que les IDs de classe, professeur et matière existent
        const classeExists = await Classe.findById(classe);
        const professeurExists = await User.findById(userId);
      
    if (!classeExists ){return res.status(400).json({message: "Classe non trouvé(e) !" })}
    if (!professeurExists) {
        return res.status(400).json({ message: " professeur  non trouvé(e) !" });
      }
      
   
  
      // Vérifier que le professeur a bien le rôle "prof"
      if (professeurExists.role !== "prof") {
        return res.status(400).json({ message: "L'utilisateur n'est pas un professeur valide." });
      }     
      
      if (!professeurExists.matiere) {
        return res.status(400).json({ message: "Le professeur n'a pas de matière assignée." });
      }

      const matiere = professeurExists.matiere;
      
if (!date ) { return res.status(400).json({ message: "date invalide." });}
if (!type|| typeof type != "string" ) { return res.status(400).json({ message: "type invalide." });}

const newDevoir = new Devoir ({
    classe,
    userId,
    matiere,
    date,
    type,
})
await newDevoir.save();

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

          const nom = decodedToken.nom;
          const prenom = decodedToken.prenom;
     const notificationMessage = `"${nom}" "${prenom}"  a été ajouté un devoir de type ${type}.`;
    await createNotification(userId, students, "info", notificationMessage, `/Devoir/${newDevoir._id}`);

res.status(201).json({ message: "devoir créé avec succès.", devoir: newDevoir });
} catch (error) {
    console.error("Erreur lors de la création de devoir :", error);
    res.status(500).json({ message: "Erreur serveur" });
}}

//update
exports.UpdateDevoir = async (req , res)  => {
try {
const authHeader = req.headers['authorization']
if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
  }
  const token = authHeader.split(" ")[1];
  const roleCheck = verifyRole(token);
  if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
  const decodedToken = jwt.verify(token, config.secret);
  const userId =decodedToken.id

   const { devoirId } = req.params;
   
 const devoirExists = await Devoir.findById(devoirId);
  if (!devoirExists) {
    return res.status(404).json({ message: "Devoir non trouvé !" });
  }
    
  const {classe , professeur,  date , type } = req.body;

  // Vérifier que les IDs de classe, professeur et matière existent
  const classeExists = await Classe.findById(classe);
  const professeurExists = await User.findById(professeur);


if (!classeExists ){return res.status(400).json({message: "Classe non trouvé(e) !" })}

if (!professeurExists) {
  return res.status(400).json({ message: " professeur  non trouvé(e) !" });
}

if (professeurExists.role !== "prof") {
  return res.status(400).json({ message: "L'utilisateur n'est pas un professeur valide." });
}     

if (!date ) { return res.status(400).json({ message: "date invalide." });}
if (!type|| typeof type != "string" ) { return res.status(400).json({ message: "type invalide." });}


const updateData = {};
    if (classe) updateData.classe = classe;
    if (professeur) updateData.professeur = professeur;
    if (professeurExists.matiere) updateData.matiere = professeurExists.matiere;
    if (date) updateData.date = date;
    if (type) updateData.type = type;

const updatedDevoir  = await Devoir.findByIdAndUpdate(
    devoirId,
    updateData,
    { new: true } 
  );

  res.status(200).json({ message: "Devoir mis à jour avec succès.", devoir: updatedDevoir });

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

   const nom = decodedToken.nom;
   const prenom = decodedToken.prenom;
const notificationMessage = `"${nom}" "${prenom}"  a été modifié un devoir de type ${type}.`;
await createNotification(userId, students, "info", notificationMessage, `/Devoir/${devoirId}`);

}catch (error) {
    console.error("Erreur lors de la mise à jour du devoir :", error);
    res.status(500).json({ message: "Erreur serveur" });
}
};


///
// Supprimer un emploi
exports.deleteDevoir = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const roleCheck = verifyRole(token);
        if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });

        const { devoirId } = req.params;

        const devoir = await Devoir.findByIdAndDelete(devoirId);
        if (!devoir) return res.status(404).send({ message: "Devoir not found!" });

         res.status(200).json({ message: "Devoir supprimé avec succès." });

  await notificationModel.deleteMany({link:`/Devoir/${devoirId}`});

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir tous les emplois
exports.getAllDevoir = async (req, res) => {
    try {
        const devoirs = await Devoir.find().populate("classe");
        res.status(200).json(devoirs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

///// get emploi by classe
exports.getDevoirByclasse = async (req, res) => {
    try {
        
        const {classeId} = req.params
        const classe = await Classe.findById(classeId)
        if ( !classe ) return res.status(404).send({message : "classe non valide"})
         const devoir = await Devoir.find({classe :classeId }).populate('matiere' , 'id nom ').populate('classe' , 'id nom ').populate('professeur' , 'id nom prenom');
        
        res.status(200).json(devoir); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//// get emploi by id prof
        exports.getDevoirByprof = async (req , res ) => {
        try {
        const {profId} = req.params 
        const prof = await User.findById(profId)
        if (!prof) return res.status(404).send({message :"prof non valide"})

        if (prof.role !== 'prof') return res.status(401).send({message :'le role de use n est pas prof'})
          
        const devoir = await Devoir.find({professeur :profId})
        .populate('matiere' , 'id nom ').populate('classe' , 'id nom ').
        populate('professeur' , 'id nom prenom')
          
        res.status(200).json(devoir)
        }catch (error){
          res.status(500).json({ message: error.message });
        }
        }
//// get emploi with token 

exports.getDevoirUser = async (req, res) => {
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
    const devoir = await Devoir.find({ classe: classeId })
      .populate("matiere", "nom") // Populer la matière avec le champ 'nom'
      .populate("professeur", "nom prenom"); // Populer le professeur avec les champs 'nom' et 'prenom'



    // Vérifier si des emplois ont été trouvés
    if (devoir.length === 0) {
      return res.status(404).json({ message: "Aucun emploi trouvé pour cette classe." });
    }

    res.status(200).json(devoir);
  } catch (error) {
    console.error("Erreur détaillée :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



//
exports.getDevoirById = async (req, res) => {
    try {
        const { devoirId } = req.params;
        const devoir = await Devoir.findById(devoirId).populate("classe");
        if (!devoir) return res.status(404).send({ message: "Devoir not found!" });

        res.status(200).json(devoir);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};