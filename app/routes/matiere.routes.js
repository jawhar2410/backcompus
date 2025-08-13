const express = require("express");
const { authJwt } = require("../middlewares");
const MatiereController = require("../controllers/matiere.controller");

const router = express.Router();

// Créer une matière
router.post("/",  MatiereController.createMatiere);

// Obtenir toutes les matières
router.get("/", MatiereController.getAllMatieres);

// Obtenir une matière par ID
router.get("/:matiereId", MatiereController.getMatiereById);

// Mettre à jour une matière
router.put("/:matiereId",  MatiereController.updateMatiere);

// Supprimer une matière
router.delete("/:matiereId",  MatiereController.deleteMatiere);

module.exports = router;