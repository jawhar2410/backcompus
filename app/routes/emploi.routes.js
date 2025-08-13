const express = require("express");
const router = express.Router();
const emploiController = require("../controllers/emploi.controller");

// Routes pour la gestion des emplois
router.post("/", emploiController.createEmploi);        // Créer un emploi (modScolarite, admin)
router.put("/:emploiId", emploiController.updateEmploi); // Mettre à jour un emploi (modScolarite, admin)
router.delete("/:emploiId", emploiController.deleteEmploi); // Supprimer un emploi (modScolarite, admin)
router.get("/", emploiController.getAllEmplois);         // Récupérer tous les emplois
router.get("/:emploiId", emploiController.getEmploiById); // Récupérer un emploi par ID
router.get("/classes/:classeId", emploiController.getEmploiByclasse);
router.get("/prof/:profId", emploiController.getEmploiByprof);
router.get("/user/token", emploiController.getEmploiUser);
router.post("/:classe", emploiController.Emploichek);
module.exports = router;
