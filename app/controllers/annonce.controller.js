const Annonce = require("../models/annonce.model");

exports.createAnnonce = async (req, res) => {
  try {
    const newAnnonce = new Annonce(req.body);
    await newAnnonce.save();
    res.status(201).json(newAnnonce);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAnnonces = async (req, res) => {
  try {
    const annonces = await Annonce.find();
    res.status(200).json(annonces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);
    if (!annonce) res.status(404).json({ message: "Annonceication not found" });
    else res.status(200).json(annonce);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAnnonce = async (req, res) => {
  try {
    const updatedAnnonce = await Annonce.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedAnnonce);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnnonce = async (req, res) => {
  try {
    await Annonce.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Annonceication deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
