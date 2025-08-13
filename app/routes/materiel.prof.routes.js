const express = require('express');
const router = express.Router();
const materielProfController = require('../controllers/materiel.prof.controller');

router.post('/materielProf/new', materielProfController.addMaterielProf);
router.get('/materielProf/list', materielProfController.getAllMaterielProfs); // Cette route doit venir en premier
router.get("/materielProf/user/:userId", materielProfController.getAllMaterielProfsByUser);
router.get('/materielProf/:id', materielProfController.getMaterielProf); // Cette route dynamique vient après la statique
router.put('/materielProf/update/:id', materielProfController.updateMaterielProf);
router.delete('/materielProf/delete/:id', materielProfController.deleteMaterielProf);

module.exports = router;