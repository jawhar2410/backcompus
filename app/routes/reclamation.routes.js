const express = require ('express')

const router = express.Router();

const reclamationController = require('../controllers/reclamation.controller');


  // Créer une nouvelle demande d'reclamation
  router.post('/', reclamationController.createReclamation);
  router.get("/user/:userId", reclamationController.getAllReclamationsByUser);
  // Récupérer la liste des demandes d'reclamation
  router.get('/:id', reclamationController.getReclamation);

  // Mettre à jour une demande d'reclamation
  router.put('/:id', reclamationController.updateReclamation);

  // Supprimer une demande d'reclamation
  router.delete('/:id', reclamationController.deleteReclamation);

  router.put('/:id', reclamationController.updateReclamationStatus);


module.exports = router ;