const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save()
    .then(savedUser => {
      if (req.body.roles) {
        return Role.find({
          name: { $in: req.body.roles }
        }).then(roles => {
          savedUser.roles = roles.map(role => role._id);
          return savedUser.save();
        });
      } else {
        return Role.findOne({ name: "user" }).then(role => {
          savedUser.roles = [role._id];
          return savedUser.save();
        });
      }
    })
    .then(() => {
      res.send({ message: "User was registered successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err });
    });
};
///
exports.signin = async (req, res) => {
  try {
    // Récupération des champs email et password depuis la requête
    const { email, password } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required." });
    }

    // Chercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    // Vérifier le mot de passe
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    // Générer le token JWT en incluant le rôle
    const token = jwt.sign(
      { id: user._id,
       role: user.role ,
      nom : user.nom,
      prenom : user.prenom, },
      config.secret, 
      { expiresIn: "240h" } // Expiration de 24 heures
    );

    res.status(200).send({
      id: user._id,
      nom : user.nom,
      prenom : user.prenom,
      email: user.email,
      role: user.role,
      accessToken: token
    });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).send({ message: "Server error" });
  }
};