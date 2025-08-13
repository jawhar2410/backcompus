const express = require ('express')

const router = express.Router();

const attestationController = require('../controllers/attestation.controller');


  // Créer une nouvelle demande d'attestation
  router.post('/attestation/new', attestationController.createAttestation);
  router.get("/attestation/user/:userId", attestationController.getAllAttestationsByUser);
  // Récupérer la liste des demandes d'attestation
  router.get('/attestation/:id', attestationController.getAttestation);

  // Mettre à jour une demande d'attestation
  router.put('/attestation/update/:id', attestationController.updateAttestation);

  // Supprimer une demande d'attestation
  router.delete('/attestation/delete/:id', attestationController.deleteAttestation);

// Ajoutez cette route pour la mise à jour du statut d'une attestation
router.put('/attestation/status/:id', attestationController.updateAttestationStatus);

module.exports = router ;