// Attestation.controller.js
const Attestation = require("../models/attestation.model");


const User = require("../models/user.model"); // Seulement si vous voulez accéder aux informations de l'utilisateur

// Obtenir toutes les attestation d'un utilisateur et joindre les informations de l'utilisateur

exports.getAllAttestationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const attestations = await Attestation.find({ user: userId })
                            // .populate('user', ['username', 'email']); // Ici, on utilise 'populate' pour joindre les informations d'utilisateur
    res.status(200).json(attestations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Attestation.controller.js
exports.createAttestation = async (req, res) => {
  try {

    console.log("Creating Attestation with data:", req.body);
    const { user, nom, prenom,email,matricule,cin,raison,type , statut } = req.body; // 'user' est l'ID de l'utilisateur
    const newAttestation = new Attestation({
      user, // Utilisation de l'ID de l'utilisateur
      nom,
      prenom,
      email,
      matricule,
      cin,
      raison,
      type,
      statut
      
    });
    const savedAttestation = await newAttestation.save();
    
    res.status(201).json(savedAttestation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




exports.getAttestation = async (req, res) => {
  try {
    const { id } = req.params;
    const attestation = await Attestation.findById(id);
    if (!attestation) {
      return res.status(404).json({ message: "Attestation not found" });
    }
    res.status(200).json(attestation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Mettre à jour une Attestation
exports.updateAttestation = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom,email,matricule,cin,raison,type , statut } = req.body;
    const updatedAttestation = await Attestation.findByIdAndUpdate(
      id,
      { 
      nom,
      prenom,
      email,
      matricule,
      cin,
      raison,
      type,
      statut },
      { new: true } // Cette option renvoie l'objet mis à jour
    );
    if (!updatedAttestation) {
      return res.status(404).json({ message: "Attestation not found" });
    }
    res.status(200).json(updatedAttestation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.deleteAttestation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAttestation = await Attestation.findByIdAndDelete(id);
    if (!deletedAttestation) {
      return res.status(404).json({ message: "Attestation not found" });
    }
    res.status(200).json({ message: "Attestation successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateAttestationStatus = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body; // Assurez-vous de récupérer le nouveau statut depuis le corps de la requête

  try {
    const updatedAttestation = await Attestation.findByIdAndUpdate(id, { statut }, { new: true });
    if (!updatedAttestation) {
      return res.status(404).json({ message: "Attestation non trouvée" });
    }
    res.status(200).json(updatedAttestation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

