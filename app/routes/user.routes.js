  module.exports = function(app) {
    const { authJwt } = require("../middlewares");
    const userController = require("../controllers/user.controller");

    // Middleware pour définir les headers CORS
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
      next();
    });

    // Routes de test
    
    app.get("/api/test/all", userController.allAccess);
    app.get("/api/test/user", authJwt.verifyToken, userController.userBoard);
    app.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], userController.adminBoard);
    app.get("/api/test/mod", [authJwt.verifyToken, authJwt.isModerator], userController.moderatorBoard);

    // Route pour créer un utilisateur
    app.post("/api/user/create", userController.createUser);
    app.post("/api/user/createScolartite",userController.createUserScolartite);
    app.put("/api/user/updateScolartite/:userId",userController.updateUser);
    app.delete("/api/user/:userId",userController.deleteUser);
    app.get("/api/user/:userId", userController.getUserWithClasses ); 
  };  
