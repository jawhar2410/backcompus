const express = require('express');
const router = express.Router();

const {verifyToken}= require ('../middlewares/authJwt')
const impressionProfController = require('../controllers/impression.prof.controller');

// Route pour créer un nouveau impressionProf
// router.route('/new').post(impressionProfController.newImpressionProf);
router.post('/new', verifyToken, impressionProfController.newImpressionProf);
// Route pour récupérer tous les impressionProfs
router.route('/impressionProfs').get(impressionProfController.getAllImpressionProfs);

// Route pour récupérer un impressionProf spécifique par son ID
router.route('/impressionProfs/:id').get(impressionProfController.getImpressionProfById);

// Route pour mettre à jour un impressionProf par son ID
router.route('/impressionProfs/update/:id').put(impressionProfController.updateImpressionProf);
router.route('/impressionProf/user/:userId').get(impressionProfController.getImpressionsByUser);
// Route pour supprimer un impressionProf par son ID
router.route('/impressionProfs/delete/:id').delete(impressionProfController.deleteImpressionProf);

module.exports = router;
