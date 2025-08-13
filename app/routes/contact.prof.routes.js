const express = require ('express')

const router = express.Router();

const contactProfController = require('../controllers/contact.prof.controller');


  // Créer une nouvelle demande d'contactProf
  router.post('/contactProf/new', contactProfController.createContactProf);
  router.get("/contactProf/user/:userId", contactProfController.getAllContactProfsByUser);
  // Récupérer la liste des demandes d'contactProf
  router.get('/contactProf/:id', contactProfController.getContactProf);

  // Mettre à jour une demande d'contactProf
  router.put('/contactProf/update/:id', contactProfController.updateContactProf);

  // Supprimer une demande d'contactProf
  router.delete('/contactProf/delete/:id', contactProfController.deleteContactProf);

// Ajoutez cette route pour la mise à jour du statut d'une contactProf


module.exports = router ;