const express = require('express');
const router = express.Router();
const rattrapageController = require('../controllers/rattrapage.controller');

// Route pour créer un nouveau rattrapage
router.post('/rattrapage/new', rattrapageController.createRattrapage);

// Route pour obtenir tous les rattrapages d'un utilisateur spécifique
router.get('/rattrapage/user/:userId', rattrapageController.getAllRattrapagesByUser);

// Route pour obtenir un rattrapage spécifique par son ID
router.get('/rattrapage/:id', rattrapageController.getRattrapage);

// Route pour mettre à jour un rattrapage spécifique par son ID
router.put('/rattrapage/update/:id', rattrapageController.updateRattrapage);

// Route pour supprimer un rattrapage spécifique par son ID
router.delete('/rattrapage/delete/:id', rattrapageController.deleteRattrapage);

// Route pour mettre à jour la réponse d'un rattrapage spécifique
router.put('/rattrapage/update/response/:id', rattrapageController.updateRattrapageStatus);

module.exports = router;
