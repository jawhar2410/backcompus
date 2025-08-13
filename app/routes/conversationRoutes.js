// /backend/routes/conversationRoutes.js
const router = require('express').Router();
const conversationController = require('../controllers/conversationController');

// Créer une nouvelle conversation
router.post('/conversations', conversationController.createConversation);

// Obtenir les conversations d'un utilisateur
router.get('/conversations/:userId', conversationController.getConversations);

// Ajouter un message à une conversation
router.post('/messages', conversationController.addMessage);

// Obtenir les messages d'une conversation
router.get('/messages/:conversationId', conversationController.getMessages);

module.exports = router;
