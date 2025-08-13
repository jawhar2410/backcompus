// routes/formulaireStageRoutes.js
const express = require('express');
const formulaireStageController = require('../controllers/formulaireStagecontroller');

const router = express.Router();

// Définit la route pour créer un nouveau formulaire de stage
router.post('/formulairestage/new', formulaireStageController.createFormulaireStage);

router.put('/formulairestage/:id', formulaireStageController.updateFormulaireStage);


module.exports = router;
