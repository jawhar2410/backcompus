const Certif = require("../models/certif.model");

exports.createCertif = async (req, res) => {
  try {
    const newCertif = new Certif(req.body);
    await newCertif.save();
    res.status(201).json(newCertif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllCertifs = async (req, res) => {
  try {
    const certifs = await Certif.find();
    res.status(200).json(certifs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCertif = async (req, res) => {
  try {
    const certif = await Certif.findById(req.params.id);
    if (!certif) res.status(404).json({ message: "Certification not found" });
    else res.status(200).json(certif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCertif = async (req, res) => {
  try {
    const updatedCertif = await Certif.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedCertif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCertif = async (req, res) => {
  try {
    await Certif.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Certification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
