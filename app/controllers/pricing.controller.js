const Pricing = require('../models/pricing.model');

// Ajouter un nouveau tarif
exports.addPricing = async (req, res) => {
  try {
    const { title, price, description } = req.body;
    const newPricing = new Pricing({ title, price, description });
    await newPricing.save();
    res.status(201).json(newPricing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir tous les tarifs
exports.getAllPricings = async (req, res) => {
  try {
    const pricings = await Pricing.find();
    res.status(200).json(pricings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mise à jour d'un tarif
exports.updatePricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description } = req.body;
    const updatedPricing = await Pricing.findByIdAndUpdate(id, { title, price, description }, { new: true });
    res.status(200).json(updatedPricing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un tarif
exports.deletePricing = async (req, res) => {
  try {
    const { id } = req.params;
    await Pricing.findByIdAndDelete(id);
    res.status(200).json({ message: 'Pricing deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
