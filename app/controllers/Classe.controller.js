const Classe = require("../models/Classe.model");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

// ✅ Vérifier le rôle (modScolarite ou admin
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
// ✅ Créer une classe
exports.createClasse = async (req, res) => {
    try {

        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const roleCheck = verifyRole(token);
        if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });

        const { nom, specialiteNiveau, specialiteDomaine, groupe, anneeScolaire } = req.body;

        const newClasse = new Classe({
            nom,
            specialiteNiveau,
            specialiteDomaine,
            groupe,
            anneeScolaire
        });

        await newClasse.save();
        res.status(201).json({ message: "Classe créée avec succès.", classe: newClasse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Mettre à jour une classe
exports.updateClasse = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const roleCheck = verifyRole(token);
        if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });

        const { classeId } = req.params;
        const updates = req.body;

        const updatedClasse = await Classe.findByIdAndUpdate(classeId, updates, { new: true });

        if (!updatedClasse) {
            return res.status(404).send({ message: "Classe non trouvée !" });
        }

        res.status(200).json({ message: "Classe mise à jour avec succès.", classe: updatedClasse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Supprimer une classe
exports.deleteClasse = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }
        const token = authHeader.split(" ")[1];
        const roleCheck = verifyRole(token);
        if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
        
        const { classeId } = req.params;
        const deletedClasse = await Classe.findByIdAndDelete(classeId);

        if (!deletedClasse) {
            return res.status(404).send({ message: "Classe non trouvée !" });
        }

        res.status(200).json({ message: "Classe supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Obtenir toutes les classes
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Classe.find();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Obtenir une classe par ID
/// get
exports.getClasseById = async (req, res) => {
    try {
        const { classeId } = req.params;

        // Trouver la classe et peupler l'emploi, les étudiants et les professeurs
        const classe = await Classe.findById(classeId)
            .populate({
                path: "emploi",
                select: "title description file", // Sélectionner les champs nécessaires de l'emploi
            })
            .populate({
                path: "etudiants",
                select: "nom prenom email role", // Sélectionner les champs nécessaires des étudiants
            })
            .populate({
                path: "professeurs",
                select: "nom prenom email role", // Sélectionner les champs nécessaires des professeurs
            });

        if (!classe) {
            return res.status(404).send({ message: "Classe non trouvée !" });
        }

        res.status(200).json(classe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
