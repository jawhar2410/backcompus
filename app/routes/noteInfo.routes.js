// Dans votre fichier de routes, par exemple, noteInfoRoutes.js

const express = require('express');
const router = express.Router();
const noteInfoController = require('../controllers/noteInfo.controller');

router.get('/', noteInfoController.getAllNoteInfos);

router.get('/count', noteInfoController.getNoteInfoCount);

router.get('/:id', noteInfoController.getNoteInfoById);
router.put('/:id', noteInfoController.updateNoteInfoStatus);
router.delete('/:id', noteInfoController.deleteNoteInfo);
router.post('/', noteInfoController.createNoteInfo);


module.exports = router;
