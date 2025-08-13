const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models/index.js");
const User = db.user;

const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  // Le token arrive sous la forme "Bearer <token>", donc on doit extraire la partie après "Bearer "
  const bearerToken = token.split(" ")[1];
  if (!bearerToken) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(bearerToken, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    // Ajouter l'ID de l'utilisateur au `req` pour l'utiliser plus tard
    req.userId = decoded.id;

    // Extraire le rôle de l'utilisateur depuis le token (s'il est stocké dans le payload)
    req.role = decoded.role;

    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "Require Admin Role!" });
};

const isModerator = (req, res, next) => {
  if (req.userRole === "modScolarite") {
    next();
    return;
  }
  res.status(403).send({ message: "Require Moderator Role!" });
};
const authJwt = {
  verifyToken,
  isAdmin,
  isModerator
};

module.exports = authJwt;
