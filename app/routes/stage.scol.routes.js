const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stage.scol.controller');

// Route pour créer un nouveau stage
router.route('/new').post(stageController.newStage);

// Route pour récupérer tous les stages
router.route('/stages').get(stageController.getAllStages);

// Route pour récupérer un stage spécifique par son ID
router.route('/stages/:id').get(stageController.getStageById);

// Route pour mettre à jour un stage par son ID
router.route('/stages/update/:id').put(stageController.updateStage);

// Route pour supprimer un stage par son ID
router.route('/stages/delete/:id').delete(stageController.deleteStage);

module.exports = router;
