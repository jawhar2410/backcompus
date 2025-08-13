// controllers/rattrapageController.js
const Rattrapage = require("../models/rattrapage.model");

// Créer un nouveau rattrapage
exports.createRattrapage = async (req, res) => {
  try {
    const newRattrapage = new Rattrapage(req.body);
    const savedRattrapage = await newRattrapage.save();
    res.status(201).json(savedRattrapage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du rattrapage" });
  }
};

// Obtenir tous les rattrapages d'un utilisateur spécifique
exports.getAllRattrapagesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const rattrapages = await Rattrapage.find({ user: userId }).populate('user');
    res.status(200).json(rattrapages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des rattrapages" });
  }
};

// Obtenir un rattrapage spécifique par son ID
exports.getRattrapage = async (req, res) => {
  try {
    const { id } = req.params;
    const rattrapage = await Rattrapage.findById(id);
    if (!rattrapage) {
      return res.status(404).json({ message: "Rattrapage non trouvé" });
    }
    res.status(200).json(rattrapage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération du rattrapage" });
  }
};

// Mettre à jour un rattrapage spécifique par son ID
exports.updateRattrapage = async (req, res) => {
  try {
    const { id } = req.params;
    const rattrapage = await Rattrapage.findByIdAndUpdate(id, req.body, { new: true });
    if (!rattrapage) {
      return res.status(404).json({ message: "Rattrapage non trouvé" });
    }
    res.status(200).json(rattrapage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du rattrapage" });
  }
};

// Supprimer un rattrapage spécifique par son ID
exports.deleteRattrapage = async (req, res) => {
  try {
    const { id } = req.params;
    const rattrapage = await Rattrapage.findByIdAndDelete(id);
    if (!rattrapage) {
      return res.status(404).json({ message: "Rattrapage non trouvé" });
    }
    res.status(200).json({ message: "Rattrapage supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression du rattrapage" });
  }
};

// Mettre à jour la réponse d'un rattrapage spécifique par son ID
exports.updateRattrapageStatus = async (req, res) => {
  const { id } = req.params;
  const { reponse } = req.body; // Assurez-vous de récupérer le nouveau response depuis le corps de la requête

  try {
    const updatedRattrapage = await Rattrapage.findByIdAndUpdate(id, { reponse }, { new: true });
    if (!updatedRattrapage) {
      return res.status(404).json({ message: "Rattrapage non trouvée" });
    }
    res.status(200).json(updatedRattrapage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};
