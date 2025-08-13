// app/routes/course.routes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const courseController = require('../controllers/course.controller'); 

// Configuration pour le téléchargement de fichiers
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Créer un cours avec un support de cours
router.post('/course/new', upload.single('courseFile'), courseController.createCourse);

router.get('/courses', courseController.getAllCourses);

// Mettre à jour un cours
router.put('/course/:id', courseController.updateCourse);

// Supprimer un cours
router.delete('/course/:id', courseController.deleteCourse);

module.exports = router;
