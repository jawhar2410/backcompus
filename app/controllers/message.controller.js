const Message = require("../models/Message");
const User = require("../models/user.model");
const mongoose = require("mongoose");

exports.createMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    // Vérifiez que les champs obligatoires sont présents
    if (!sender || !receiver || !text) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    const newMessage = new Message({ sender, receiver, text });
    const savedMessage = await newMessage.save();

    // Émettre un événement Socket.IO pour informer les clients
    const io = req.app.get("io"); // Récupérer l'instance `io` depuis l'application
    io.emit("newMessage", savedMessage); // Émettre l'événement à tous les clients

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'envoi du message", error });
  }
};



exports.getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.query; 
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des messages", error });
  }
};




exports.getUsersConversation = async (req, res) => {
  try {
    const { user } = req.query;

    // Vérifier si l'ID utilisateur est valide
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: "ID d'utilisateur invalide." });
    }

    // Récupérer tous les messages où l'utilisateur est impliqué
    const messages = await Message.find({
      $or: [
        { sender: user },
        { receiver: user },
      ],
    });

    // Extraire les ID des autres utilisateurs impliqués
    const userIds = messages.map((message) => {
      return message.sender.toString() === user ? message.receiver : message.sender;
    });

    // Supprimer les doublons
    const uniqueUserIds = [...new Set(userIds)];

    // Récupérer les informations des utilisateurs
    const users = await User.find(
      { _id: { $in: uniqueUserIds } },
      { password: 0, __v: 0 } // Exclure les champs sensibles
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur détaillée :", error); // Afficher l'erreur dans les logs
    res.status(500).json({ message: "Erreur lors de la récupération des conversations", error: error.message || error });
  }
};