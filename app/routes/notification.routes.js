// Dans votre fichier de routes, par exemple, notificationRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.get('/notifications', notificationController.getAllNotifications);
router.get('/notifications/count', notificationController.getNotificationCount);
router.get('/notifications/:id', notificationController.getNotificationById);
router.put('/notifications/:id', notificationController.updateNotificationStatus);
router.delete('/notifications/:id', notificationController.deleteNotification);


router.post('/', notificationController.createNotification);
router.get('/user/:userId', notificationController.getUserNotifications);
router.put('/readby/:notificationId/:userId' , notificationController.markAsRead);
module.exports = router;
