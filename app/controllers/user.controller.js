exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
/////
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config'); //////
const Classe = require("../models/Classe.model");
const mongoose = require("mongoose");



exports.createUser = async (req, res) => {
try {
  const { nom, prenom, email, password, cin, specialite, classe, domaine, groupe, telephone, dateNaissance, role } = req.body;

  if (!nom || !prenom || !email || !password || !role) {
    return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Cet email est déjà utilisé." });
  }

  const validRoles = ["etudiant", "modScolarite", "prof", "admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Rôle invalide." });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    nom,
    prenom,
    email,
    password: hashedPassword,
    cin,
    specialite,
    classe,
    domaine,
    groupe,
    telephone,
    dateNaissance,
    role
  });

  await newUser.save();
  res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
} catch (error) {
  console.error("Erreur lors de la création de l'utilisateur :", error);
  res.status(500).json({ message: "Erreur serveur" });
}
};

///
const nodemailer = require('nodemailer');

async function sendMail(email, password) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'joenl2410@gmail.com', 
      pass: 'pllf gvdg dezi evja' 
    }
  });

  let mailOptions = {
    from: 'joenl2410@gmail.com',
    to: email,
    subject: 'Votre compte a été créé',
    text: `Bonjour, votre compte a été créé avec succès. Voici vos informations de connexion :\n\nEmail: ${email}\nMot de passe: ${password}\n\nVeuillez changer votre mot de passe après la première connexion.`,
    html: `<h4>Bonjour,</h4><p>Votre compte a été créé avec succès. Voici vos informations de connexion :</p><ul><li><strong>Email :</strong> ${email}</li><li><strong>Mot de passe :</strong> ${password}</li></ul><p>Veuillez changer votre mot de passe après la première connexion.</p>`
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('📩 Email envoyé: %s', info.messageId);
  } catch (error) {
    console.error('❌ Erreur d\'envoi d\'email:', error);
  }
}

  // Fonction pour créer un utilisateur avec role modScolarite
    exports.createUserScolartite = async (req, res) => {
      try {
        // 🔹 Vérification du token et du rôle
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
        }

        const token = authHeader.split(" ")[1]; // Extraire le token
        let decodedToken;
        try {
          decodedToken = jwt.verify(token, config.secret);
        } catch (err) {
          return res.status(401).send({ message: "Unauthorized! Invalid token." });
        }

        if (decodedToken.role !== "modScolarite" && decodedToken.role !== "admin") {
          return res.status(403).send({ message: "Access denied! Only modScolarite or admin can create users." });
        }

        // 🔹 Extraire les données de la requête
        const { nom, prenom, email, cin, role, classe, classes } = req.body;

        if (!nom || !prenom || !email || !cin || !role) {
          return res.status(400).send({ message: "All fields are required (nom, prenom, email, cin, role)." });
        }

        // 🔹 Vérifier l'unicité de l'email et du CIN
        const existingUser = await User.findOne({ $or: [{ email: email }, { cin: cin }] });
        if (existingUser) {
          return res.status(400).send({ message: "Email or CIN already exists!" });
        }

        // 🔹 Vérifier que le rôle est valide
        if (!["prof", "etudiant"].includes(role)) {
          return res.status(400).send({ message: "Invalid role! Only 'prof' or 'etudiant' are allowed." });
        }

        let assignedClasses = [];

        if (role === "prof") {
          // ✅ Permettre la création sans classes
          if (classes && classes.length > 0) {
            assignedClasses = await Classe.find({ _id: { $in: classes } });
            if (assignedClasses.length !== classes.length) {
              return res.status(400).send({ message: "One or more classes not found!" });
            }
          }
        } else if (role === "etudiant") {
          if (!classe) {
            return res.status(400).send({ message: "A student must have exactly one class!" });
          }
          const assignedClass = await Classe.findById(classe);
          if (!assignedClass) {
            return res.status(400).send({ message: "Class not found!" });
          }
          assignedClasses = [assignedClass];
        }

        // 🔹 Générer un mot de passe basé sur le CIN
        const hashedPassword = bcrypt.hashSync(cin, 8);

        // 🔹 Créer l'utilisateur
        const newUser = new User({
          nom,
          prenom,
          email,
          cin,
          password: hashedPassword,
          role,
          classe: role === "etudiant" ? classe : undefined,
          classes: role === "prof" ? classes : []
        });

        // 🔹 Sauvegarder l'utilisateur
        await newUser.save();
        sendMail(email , cin);
        // 🔹 Ajouter l'utilisateur aux classes correspondantes uniquement s'il en a
        if (role === "prof" && assignedClasses.length > 0) {
          for (const assignedClass of assignedClasses) {
            assignedClass.professeurs.push(newUser._id);
            await assignedClass.save();
          }
        } else if (role === "etudiant") {
          assignedClasses[0].etudiants.push(newUser._id);
          await assignedClasses[0].save();
        }

        res.status(201).send({ message: `User ${role} created successfully!`, user: newUser });

      } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur :", error);
        res.status(500).send({ message: "Erreur serveur", error: error.message });
      }
    };

  //// update 

  exports.updateUser = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
  
      const token = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, config.secret);
      } catch (err) {
        return res.status(401).send({ message: "Unauthorized! Invalid token." });
      }
  
      const authenticatedUserId = decodedToken.id;
      const authenticatedUserRole = decodedToken.role;
  
      const { userId } = req.params;
      let updateData = req.body;
  
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: "User not found!" });
      }
  
      if (authenticatedUserId !== userId && authenticatedUserRole !== "admin" && authenticatedUserRole !== "modScolarite") {
        return res.status(403).send({ message: "Access denied! You can only update your own password." });
      }
  
      if (authenticatedUserId === userId && authenticatedUserRole !== "admin" && authenticatedUserRole !== "modScolarite") {
        if (!updateData.password) {
          return res.status(403).send({ message: "Access denied! You can only update your password." });
        }
        updateData = { password: updateData.password };
      }
  
      if (updateData.password) {
        updateData.password = bcrypt.hashSync(updateData.password, 8);
      }
  
      // 🔹 Gestion des classes en fonction du rôle
      if (user.role === "prof") {
        // Pour un professeur, on utilise le champ `classes`
        if (updateData.classes && Array.isArray(updateData.classes)) {
          const validClasses = await Classe.find({ _id: { $in: updateData.classes } });
          if (validClasses.length !== updateData.classes.length) {
            return res.status(400).send({ message: "One or more class IDs are invalid!" });
          }
  
          // Retirer l'utilisateur des anciennes classes
          await Classe.updateMany(
            { professeurs: user._id },
            { $pull: { professeurs: user._id } }
          );
  
          // Ajouter l'utilisateur aux nouvelles classes
          await Classe.updateMany(
            { _id: { $in: updateData.classes } },
            { $addToSet: { professeurs: user._id } }
          );
  
          user.classes = updateData.classes; // Mettre à jour les classes du professeur
          user.classe = undefined; // S'assurer que le champ `classe` est vide
        }
      } else if (user.role === "etudiant") {
        // Pour un étudiant, on utilise le champ `classe`
        if (updateData.classe) {
          if (mongoose.Types.ObjectId.isValid(updateData.classe)) {
            const classe = await Classe.findById(updateData.classe);
            if (!classe) {
              return res.status(400).send({ message: "Classe not found with the provided ID!" });
            }
  
            // Retirer l'étudiant de l'ancienne classe
            if (user.classe) {
              await Classe.findByIdAndUpdate(user.classe, { $pull: { etudiants: user._id } });
            }
  
            // Ajouter l'étudiant à la nouvelle classe
            await Classe.findByIdAndUpdate(updateData.classe, { $addToSet: { etudiants: user._id } });
  
            user.classe = updateData.classe; // Mettre à jour la classe de l'étudiant
            user.classes = undefined; // S'assurer que le champ `classes` est vide
          } else {
            return res.status(400).send({ message: "Invalid classe ID!" });
          }
        }
      }
  
      // 🔹 Mise à jour des autres champs
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined && key !== "classes" && key !== "classe") {
          user[key] = updateData[key];
        }
      });
  
      await user.save();
  
      res.status(200).send({ message: "User updated successfully!", user });
  
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      res.status(500).send({ message: "Erreur serveur", error: error.message });
    }
  };

  ///
  exports.deleteUser = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
  
      const token = authHeader.split(" ")[1];
      let decodedToken;
      try {
        decodedToken = jwt.verify(token, config.secret);
      } catch (err) {
        return res.status(401).send({ message: "Unauthorized! Invalid token." });
      }
  
      const authenticatedUserId = decodedToken.id;
      const authenticatedUserRole = decodedToken.role;
  
      const { userId } = req.params;
  
      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: "User not found!" });
      }
  
      // Vérifier les permissions
      if (authenticatedUserId !== userId && authenticatedUserRole !== "admin" && authenticatedUserRole !== "modScolarite") {
        return res.status(403).send({ message: "Access denied! You can only delete your own account." });
      }
  
      // 🔹 Supprimer l'utilisateur des classes en fonction de son rôle
      if (user.role === "etudiant") {
        // Si l'utilisateur est un étudiant, le retirer de sa classe
        if (user.classe) {
          await Classe.findByIdAndUpdate(user.classe, { $pull: { etudiants: user._id } });
        }
      } else if (user.role === "prof") {
        // Si l'utilisateur est un professeur, le retirer de toutes ses classes
        if (user.classes && user.classes.length > 0) {
          await Classe.updateMany(
            { _id: { $in: user.classes } },
            { $pull: { professeurs: user._id } }
          );
        }
      }
  
      // 🔹 Supprimer l'utilisateur de la collection User
      await User.findByIdAndDelete(userId);
  
      res.status(200).send({ message: "User deleted successfully!" });
  
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      res.status(500).send({ message: "Erreur serveur", error: error.message });
    }
  };

  ///
  exports.getUserWithClasses = async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized! Bearer token missing or invalid." });
      }
  
      const token = authHeader.split(" ")[1];
      const decodedToken = jwt.verify(token, config.secret);
  
      const { userId } = req.params;
  
      // Vérifier les permissions
      if (
        decodedToken.role !== "admin" &&
        decodedToken.role !== "modScolarite" &&
        decodedToken.id !== userId
      ) {
        return res.status(403).send({ message: "Access denied! You are not authorized to access this resource." });
      }
  
      // Trouver l'utilisateur sans peupler les classes
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: "User not found!" });
      }
  
      // Peupler les classes en fonction du rôle
      let populatedUser;
      if (user.role === "prof") {
        populatedUser = await User.findById(userId).populate({
          path: "classes",
          select: "nom specialiteNiveau specialiteDomaine groupe anneeScolaire", // Sélectionner les champs nécessaires
        });
      } else if (user.role === "etudiant") {
        populatedUser = await User.findById(userId).populate({
          path: "classe",
          select: "nom specialiteNiveau specialiteDomaine groupe anneeScolaire", // Sélectionner les champs nécessaires
        });
      } else {
        // Si l'utilisateur n'est ni un professeur ni un étudiant, renvoyer l'utilisateur sans peupler les classes
        populatedUser = user;
      }
  
      // Renvoyer les données de l'utilisateur avec les classes peuplées
      const response = {
        _id: populatedUser._id,
        nom: populatedUser.nom,
        prenom: populatedUser.prenom,
        email: populatedUser.email,
        role: populatedUser.role,
        classes: populatedUser.role === "prof" ? populatedUser.classes : undefined, // Classes pour un professeur
        classe: populatedUser.role === "etudiant" ? populatedUser.classe : undefined, // Classe pour un étudiant
      };
  
      res.status(200).json(response);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur :", error);
      res.status(500).send({ message: "Erreur serveur", error: error.message });
    }
  };