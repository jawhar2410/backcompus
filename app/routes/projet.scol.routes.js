const express = require('express');
const router = express.Router();
const projetController = require('../controllers/projet.scol.controller');

// Route pour créer un nouveau projet
router.route('/new').post(projetController.newProjet);

// Route pour récupérer tous les projets
router.route('/projets').get(projetController.getAllProjets);

// Route pour récupérer un projet spécifique par son ID
router.route('/projets/:id').get(projetController.getProjetById);

// Route pour mettre à jour un projet par son ID
router.route('/projets/update/:id').put(projetController.updateProjet);

// Route pour supprimer un projet par son ID
router.route('/projets/delete/:id').delete(projetController.deleteProjet);

module.exports = router;
