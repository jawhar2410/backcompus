// ContactProf.controller.js
const ContactProf = require("../models/contact.prof.model");


const User = require("../models/user.model"); // Seulement si vous voulez accéder aux informations de l'utilisateur

// Obtenir toutes les contactProf d'un utilisateur et joindre les informations de l'utilisateur

exports.getAllContactProfsByUser = async (req, res) => {
  try {
    const userId = req.params.userId; // Assurez-vous que cela correspond à la façon dont l'ID est envoyé
    if (!userId) {
      return res.status(400).send({ message: "L'identifiant utilisateur est manquant." });
    }
    // Supposons que userId est maintenant validé et non undefined
    const contactProfs = await ContactProf.find({ user: userId });
    res.send(contactProfs);
  } catch (error) {
    res.status(500).send({ message: "Erreur lors de la récupération des contacts." });
  }
};



// ContactProf.controller.js
exports.createContactProf = async (req, res) => {
  try {

    console.log("Creating ContactProf with data:", req.body);
    const { user,objet,message } = req.body; // 'user' est l'ID de l'utilisateur
    const newContactProf = new ContactProf({
      user, // Utilisation de l'ID de l'utilisateur
      objet,
      message,
      
    });
    const savedContactProf = await newContactProf.save();
    
    res.status(201).json(savedContactProf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




exports.getContactProf = async (req, res) => {
  try {
    const { id } = req.params;
    const contactProf = await ContactProf.findById(id);
    if (!contactProf) {
      return res.status(404).json({ message: "ContactProf not found" });
    }
    res.status(200).json(contactProf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Mettre à jour une ContactProf
exports.updateContactProf = async (req, res) => {
  try {
    const { id } = req.params;
    const {objet,message} = req.body;
    const updatedContactProf = await ContactProf.findByIdAndUpdate(
      id,
      { 
     objet,
    message, },
      { new: true } // Cette option renvoie l'objet mis à jour
    );
    if (!updatedContactProf) {
      return res.status(404).json({ message: "ContactProf not found" });
    }
    res.status(200).json(updatedContactProf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.deleteContactProf = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContactProf = await ContactProf.findByIdAndDelete(id);
    if (!deletedContactProf) {
      return res.status(404).json({ message: "ContactProf not found" });
    }
    res.status(200).json({ message: "ContactProf successfully deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateContactProfStatus = async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body; // Assurez-vous de récupérer le nouveau statut depuis le corps de la requête

  try {
    const updatedContactProf = await ContactProf.findByIdAndUpdate(id, { statut }, { new: true });
    if (!updatedContactProf) {
      return res.status(404).json({ message: "ContactProf non trouvée" });
    }
    res.status(200).json(updatedContactProf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
};

