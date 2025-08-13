const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonce.controller');

router.post('/annonce/new', annonceController.createAnnonce);
router.get('/annonces', annonceController.getAllAnnonces);
router.get('/annonce/:id', annonceController.getAnnonce);
router.put('/annonce/update/:id', annonceController.updateAnnonce);
router.delete('/annonce/delete/:id', annonceController.deleteAnnonce);

module.exports = router;
