const MaterielProf = require('../models/materiel.prof.model');
const User = require("../models/user.model"); 
// Ajouter un nouvel 

exports.addMaterielProf = async (req, res) => {
  try {

    console.log("Creating Materiel with data:", req.body);
    const { user,materiel,remarque,schedule,location } = req.body; // 'user' est l'ID de l'utilisateur
    const newMaterielProf = new MaterielProf({
      user, // Utilisation de l'ID de l'utilisateur
      materiel,
      remarque,
      schedule,
      location,
      
    });
    const savedMaterielProf = await newMaterielProf.save();
    
    res.status(201).json(savedMaterielProf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getMaterielProf = async (req, res) => {
  try {
    const { id } = req.params;
    const materielProf = await MaterielProf.findById(id);
    if (!materielProf) {
      return res.status(404).json({ message: "MaterielProf not found" });
    }
    res.status(200).json(materielProf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Mettre à jour une MaterielProf
exports.updateMaterielProf = async (req, res) => {
  try {
    const { id } = req.params;
    const { user,materiel,remarque,schedule,location } = req.body;
    const updatedMaterielProf = await MaterielProf.findByIdAndUpdate(
      id,
      { 
        user, // Utilisation de l'ID de l'utilisateur
        materiel,
        remarque,
        schedule,
        location,},
      { new: true } // Cette option renvoie l'objet mis à jour
    );
    if (!updatedMaterielProf) {
      return res.status(404).json({ message: "MaterielProf not found" });
    }
    res.status(200).json(updatedMaterielProf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.deleteMaterielProf = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMaterielProf = await MaterielProf.findByIdAndDelete(id);
    if (!deletedMaterielProf) {
      return res.status(404).json({ message: "MaterielProf not found" });
    }
    res.status(200).json({ message: "MaterielProf successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllMaterielProfsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const materielProfs = await MaterielProf.find({ user: userId })
                            // .populate('user', ['username', 'email']); // Ici, on utilise 'populate' pour joindre les informations d'utilisateur
    res.status(200).json(materielProfs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllMaterielProfs = async (req, res) => {
  try {
    const allMaterielProfs = await MaterielProf.find({});
    res.status(200).json(allMaterielProfs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};