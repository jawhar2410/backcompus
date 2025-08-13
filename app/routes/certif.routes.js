const express = require('express');
const router = express.Router();
const certifController = require('../controllers/certif.controller');

router.post('/certif/new', certifController.createCertif);
router.get('/certifs', certifController.getAllCertifs);
router.get('/certif/:id', certifController.getCertif);
router.put('/certif/update/:id', certifController.updateCertif);
router.delete('/certif/delete/:id', certifController.deleteCertif);

module.exports = router;
