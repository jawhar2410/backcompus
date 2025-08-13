const Absence = require("../models/absence.model");
const jwt = require("jsonwebtoken"); 
const config = require("../config/auth.config"); // Vérifiez que ce fichier contient bien `config.secret`
const User = require("../models/user.model");
const Matiere = require("../models/matiere.model");

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

exports.marquerAbsence = async (req, res) => {
    try {

        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const roleCheck = verifyRole(token);
        if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });

        const { etudiant, status ,matiere ,date } = req.body;

        if (!etudiant  || !matiere || !status || !date) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

    const matiereExists = await Matiere.findById(matiere);
    const user = await User.findById(etudiant);


  if (!user) {
    return res.status(400).json({ message: " etudiant  non trouvé(e) !" });
  }
  if (user.role !== "etudiant" ) {
    return res.status(400).json({ message: "user doit etre un etudiant" });
}
  
  if ( !matiereExists) {
    return res.status(400).json({ message: " matière non trouvé(e) !" });
  }
 
        const nouvelleAbsence = new Absence({
            etudiant,
            matiere,
            status,
            date 
        });

        await nouvelleAbsence.save();
        res.status(201).json(nouvelleAbsence);
    } catch (error) {
        console.error(" Erreur lors de l'ajout de l'absence :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
////


exports.getAbsencesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Vérifier si l'ID est valide
        if (!userId) {
            return res.status(400).json({ message: "L'ID de l'utilisateur est requis." });
        }

        // Récupérer les absences de cet utilisateur
        const absences = await Absence.find({ etudiant: userId }).populate("matiere") .populate({
            path: "etudiant", 
            populate: {
              path: "classe", 
            },
          }); 

        res.status(200).json(absences);
    } catch (error) {   
        console.error(" Erreur lors de la récupération des absences :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
