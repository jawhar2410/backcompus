const express = require('express');
const router = express.Router();
const testController = require('../controllers/file.controller');

// Route pour créer un nouveau test
router.route('/new').post(testController.newTest);

// Route pour récupérer tous les tests
router.route('/files').get(testController.getAllTests);

// Route pour récupérer un test spécifique par son ID
router.route('/files/:id').get(testController.getTestById);

// Route pour mettre à jour un test par son ID
router.route('/files/update/:id').put(testController.updateTest);

// Route pour supprimer un test par son ID
router.route('/files/delete/:id').delete(testController.deleteTest);

module.exports = router;
