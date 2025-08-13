// note.controller.js
const Matiere = require("../models/matiere.model");
const Note = require("../models/note.model");
const User = require("../models/user.model"); // Seulement si vous voulez accéder aux informations de l'utilisateur
const jwt = require("jsonwebtoken"); 
const config = require("../config/auth.config");
const { createNotification } = require ('../controllers/notification.controller');
const Notification = require("../models/notification.model")

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

// Obtenir toutes les notes d'un utilisateur et joindre les informations de l'utilisateur

exports.getAllNotesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const notes = await Note.find({ user: userId })
                            // .populate('user', ['username', 'email']); // Ici, on utilise 'populate' pour joindre les informations d'utilisateur
    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// note.controller.js
exports.createNote = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
    }
    const token = authHeader.split(" ")[1];
    const roleCheck = verifyRole(token);
    if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
      const decodedToken = jwt.verify(token, config.secret);
     const userId =decodedToken.id
    const { etudiant, matiere, note } = req.body; 
    
    if (!etudiant  || !matiere || !note ) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  const matiereExists = await Matiere.findById(matiere);
  const user = await User.findById(etudiant)
  if (!user) {
    return res.status(400).json({ message: " etudiant  non trouvé(e) !" });
  }
  if (user.role !== "etudiant" ) {
    return res.status(400).json({ message: "user doit etre un etudiant" });
}
  
  if ( !matiereExists) {
    return res.status(400).json({ message: " matière non trouvé(e) !" });
  }
 

    const newNote = new Note({
      etudiant, 
      matiere,
      note,
      
    });
  
    const savedNote = await newNote.save();

    const matierename = matiereExists.nom;
     const notificationMessage = `le note de la matiere ${matierename} a été ajouté .`;
        await createNotification(userId, etudiant, "info", notificationMessage, `/note/${savedNote._id}`);
    
    res.status(201).json(savedNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};














exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Mettre à jour une note
exports.updateNote = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
    }
    const token = authHeader.split(" ")[1];
    const roleCheck = verifyRole(token);
    if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
      const decodedToken = jwt.verify(token, config.secret);
     const userId =decodedToken.id
    const { id } = req.params;
    const { etudiant, matiere, note  } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { etudiant, matiere, note},
      { new: true } // Cette option renvoie l'objet mis à jour
    );
    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(updatedNote);
    const matiereExists = await Matiere.findById(matiere)
    const matierename = matiereExists.nom;


    const notificationMessage = `le note de la matiere ${matierename} a été modifié .`;
    await createNotification(userId, etudiant, "info", notificationMessage, `/note/${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.deleteNote = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
    }
    const token = authHeader.split(" ")[1];
    const roleCheck = verifyRole(token);
    if (!roleCheck.authorized) return res.status(403).send({ message: roleCheck.message });
      const decodedToken = jwt.verify(token, config.secret);
     const userId =decodedToken.id

    const { id } = req.params;
    const deletedNote = await Note.findByIdAndDelete(id);
    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    await Notification.deleteMany({link:`/note/${id}`})
    const matiere = await Matiere.findById(deletedNote.matiere)
    const matierename = matiere.nom;
    const etudiant = deletedNote.etudiant;

    const notificationMessage = `le note de la matiere ${matierename} a été supprimé .`;
    await createNotification(userId, etudiant, "info", notificationMessage, `/note/${id}`);

    res.status(200).json({ message: "Note successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
