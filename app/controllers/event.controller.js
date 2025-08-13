const Event = require('../models/event.model');
const jwt = require("jsonwebtoken"); 
const config = require("../config/auth.config"); 
const { createNotification } = require ('../controllers/notification.controller');
const Classe = require('../models/Classe.model');

const verifyRole = (token) => {
    try {
        const decodedToken = jwt.verify(token, config.secret);
        if (decodedToken.role !== "modScolarite" && decodedToken.role !== "admin") {
            return { authorized: false, message: "Access denied! Only modScolarite or admin can perform this action." };
        }   
        return { authorized: true };
    } catch (err) {
        return { authorized: false, message: "Unauthorized! Invalid token." };
    }
};  
// Ajouter un nouvel événement
exports.addEvent = async (req, res) => {
  try {

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
    }
    const token = authHeader.split(" ")[1];
    const roleCheck = verifyRole(token);
    if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
      const decodedToken = jwt.verify(token, config.secret);
      const userId =decodedToken.id;

      

    const newEvent = new Event(req.body);
    await newEvent.save();

     // Récupérer toutes les classes et accumuler les étudiants
          const classesData = await Classe.find().populate("etudiants");
          if (!classesData || classesData.length === 0) {
              return res.status(404).json({ message: "Aucune classe trouvée" });
          }
    
          // Extraire les IDs des étudiants de toutes les classes
          let students = [];
          classesData.forEach(classe => {
              students = students.concat(classe.etudiants.map(etudiant => etudiant._id));
          });
    
          // Supprimer les doublons (au cas où un étudiant appartient à plusieurs classes)
          students = [...new Set(students)];

     const notificationMessage = `un evenement "${newEvent.titre}" a été ajouté par la scolarité.`;
    await createNotification(userId, students, "info", notificationMessage, `/event/${newEvent._id}`);

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/// enregistrement dans un event 
exports.participeEvent = async (req ,res ) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, config.secret);
    const user = decodedToken.id

    await Event.updateOne(
      { _id: req.params.id },
      { $addToSet: { participants: user } } 
    );


  } catch (error ){
    res.status(400).json({ message: error.message });
  }
}

// Obtenir tous les événements
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('participants','nom prenom ');
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

  // Obtenir tous les événements
  exports.getEventByid = async (req, res) => {
    try {
  const eventid  = req.params.id;
      const event = await Event.findById(eventid).populate({path : 'participants',
        populate: {
          path :'classe ' ,
          model :'Classe' ,
        }
      });
      if (!eventid) {
        return res.status(404).json({ message: "Event non trouvée !" });
      }
      res.status(200).json(event);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }; 


// Mise à jour d'un événement
exports.updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
