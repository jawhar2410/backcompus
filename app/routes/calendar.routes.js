const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authJwt } = require('../middlewares');

// Route pour récupérer tous les événements
router.get('/calendar-events', calendarController.getAllEvents);

// Routes pour créer, mettre à jour et supprimer un événement
router.post('/create-event', [authJwt.verifyToken], calendarController.createEvent);
router.put('/update-event', [authJwt.verifyToken], calendarController.updateEvent);
router.delete('/delete-event/:eventId', [authJwt.verifyToken], calendarController.deleteEvent);

module.exports = router;
