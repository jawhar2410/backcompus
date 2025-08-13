const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

router.post('/', eventController.addEvent);
router.post('/participer/:id', eventController.participeEvent);
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventByid);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;