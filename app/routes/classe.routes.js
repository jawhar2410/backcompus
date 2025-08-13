const express = require("express");
const router = express.Router();
const classeController = require("../controllers/Classe.controller");

// Routes pour la gestion des classes
router.post("/", classeController.createClasse);         // Créer une classe (modScolarite, admin)
router.put("/:classeId", classeController.updateClasse); // Modifier une classe (modScolarite, admin)
router.delete("/:classeId", classeController.deleteClasse); // Supprimer une classe (modScolarite, admin)
router.get("/", classeController.getAllClasses);         // Récupérer toutes les classes
router.get("/:classeId", classeController.getClasseById); // Récupérer une classe par ID

module.exports = router;
