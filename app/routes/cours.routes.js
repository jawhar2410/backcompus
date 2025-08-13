const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const coursController = require("../controllers/cours.controller");

// Configuration de multer pour stocker les fichiers sur le disque
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes pour les cours

// Créer un cours avec un support de cours
router.post("/", upload.single("fichierPDF"), coursController.createCours);

// Obtenir tous les cours
router.get("/", coursController.getAllCours);

// Obtenir un cours spécifique par son ID
router.get("/:id", coursController.getCours);

// Mettre à jour un cours
router.put("/:id", upload.single("fichierPDF"), coursController.editCours);

// Supprimer un cours
router.delete("/:id", coursController.deleteCours);

// Obtenir tous les cours d'un professeur spécifique
router.get("/prof/:professeurId", coursController.getCoursByProfesseur);

// Obtenir tous les cours d'une classe spécifique
router.get("/classe/:classeId", coursController.getCoursByClasse);

// Routes pour les commentaires et les réponses

// Ajouter un commentaire à un cours
router.post("/:id/commentaires", coursController.ajouterCommentaire);

// Répondre à un commentaire
router.post("/:id/commentaires/:commentaireId/reponses", coursController.repondreCommentaire);

// Récupérer les commentaires d'un cours
//router.get("/:id/commentaires", coursController.getCommentaires);

// Modifier un commentaire
router.put("/:id/commentaires/:commentaireId", coursController.modifierCommentaire);

// Supprimer un commentaire
router.delete("/:id/commentaires/:commentaireId", coursController.supprimerCommentaire);

// Modifier une réponse à un commentaire
router.put("/:id/commentaires/:commentaireId/reponses/:reponseId", coursController.modifierReponse);

// Supprimer une réponse à un commentaire
router.delete("/:id/commentaires/:commentaireId/reponses/:reponseId", coursController.supprimerReponse);

module.exports = router;