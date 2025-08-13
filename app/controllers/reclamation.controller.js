const Reclamation = require("../models/reclamation.model");

//  Obtenir toutes les réclamations d'un utilisateur
exports.getAllReclamationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reclamations = await Reclamation.find({ user: userId }).populate("user", ["username", "email"]);
    res.status(200).json(reclamations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

//  Créer une nouvelle réclamation
exports.createReclamation = async (req, res) => {
  try {
    
    const { user, description, type, reponse } = req.body; // 'user' est l'ID de l'utilisateur

    const newReclamation = new Reclamation({
      user,
      description,
      type,
      reponse: reponse || "En attente", // Valeur par défaut si non fournie
    });

    const savedReclamation = await newReclamation.save();
    res.status(201).json(savedReclamation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

//  Obtenir une réclamation par son ID
exports.getReclamation = async (req, res) => {
  try {
    const { id } = req.params;
    const reclamation = await Reclamation.findById(id).populate("user", ["username", "email"]);
    if (!reclamation) {
      return res.status(404).json({ message: "Réclamation introuvable" });
    }
    res.status(200).json(reclamation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

//  Mettre à jour une réclamation
exports.updateReclamation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; 

    const updatedReclamation = await Reclamation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, }
    );

    if (!updatedReclamation) {
      return res.status(404).json({ message: "Réclamation introuvable" });
    }
    res.status(200).json(updatedReclamation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

//  Supprimer une réclamation
exports.deleteReclamation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReclamation = await Reclamation.findByIdAndDelete(id);
    if (!deletedReclamation) {
      return res.status(404).json({ message: "Réclamation introuvable" });
    }
    res.status(200).json({ message: "Réclamation supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

//  Mettre à jour le statut de la réclamation
exports.updateReclamationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { reponse } = req.body;

    const updatedReclamation = await Reclamation.findByIdAndUpdate(id, { reponse }, { new: true });
    if (!updatedReclamation) {
      return res.status(404).json({ message: "Réclamation introuvable" });
    }
    res.status(200).json(updatedReclamation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};
