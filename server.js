const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const path = require('path');
require("dotenv").config();

const http = require("http"); 
const socketConfig = require("./socket"); 

const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();


// Configuration for body-parser to handle large entities
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// CORS configuration
var corsOptions = {
  origin: "http://localhost:8081",
};
app.use(cors(corsOptions));

// Use JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Compus application." });
});

// Import and use user routes
require("./app/routes/user.routes")(app);
require("./app/routes/auth.routes")(app);

// Import other routes
const attestationRoute = require("./app/routes/attestation.routes");
const certifRoute = require("./app/routes/certif.routes");
const reclamationRoute = require("./app/routes/reclamation.routes");
const uploadRoute = require('./app/routes/upload.route');
const calendarRoute = require("./app/routes/calendar.routes");
const eventRoute = require("./app/routes/event.routes");
const rattrapageRoute = require("./app/routes/rattrapage.routes");
const courseRoute = require("./app/routes/cours.routes");
const pricingRoute = require("./app/routes/pricing.routes");
const formulaireStageRoute = require("./app/routes/formulaireStage.routes");
const noteRoute = require("./app/routes/note.routes");
const notificationRoute = require("./app/routes/notification.routes");
const noteInfoRoute = require("./app/routes/noteInfo.routes");
const emploiRoutes = require("./app/routes/emploi.routes");
const emploiExamenRoutes = require("./app/routes/EmploiExamens.routes");
const classeRoutes = require("./app/routes/classe.routes");
const absenceRoutes = require("./app/routes/absence.routes");
const contactprofRoute = require("./app/routes/contact.prof.routes");
const annonceRoute = require("./app/routes/annonce.routes");
const fileRoute = require("./app/routes/file.routes");
const impressionprofRoute = require("./app/routes/impression.prof.routes");
const materielprofRoute = require("./app/routes/materiel.prof.routes");
const stagescolRoute = require("./app/routes/stage.scol.routes");
const projetscolRoute = require("./app/routes/projet.scol.routes");
const downloadRoutes = require('./app/routes/download.routes');
const conversationRoutes = require('./app/routes/conversationRoutes');
const matiereRoute  = require('./app/routes/matiere.routes');
const devoirRoute = require('./app/routes/Devoir.routes');
const messageRoute = require('./app/routes/message.routes')
// Use other routes
app.use('/download', downloadRoutes);
app.use("/attestation", attestationRoute);
app.use("/certif", certifRoute);
app.use("/rattrapage", rattrapageRoute);
app.use("/annonce", annonceRoute);
app.use("/file", fileRoute);
app.use("/impressionProf", impressionprofRoute);
app.use("/materielProf", materielprofRoute);
app.use("/contactProf", contactprofRoute);
app.use("/stageScol", stagescolRoute);
app.use("/projetScol", projetscolRoute);
app.use('/upload', uploadRoute);
app.use("/pricing", pricingRoute);
app.use("/event", eventRoute);
app.use("/reclamation", reclamationRoute);
app.use("/calendar", calendarRoute);
app.use("/cours", courseRoute);
app.use("/formulaireStage", formulaireStageRoute);
app.use("/note", noteRoute);
app.use("/notification", notificationRoute);
app.use("/noteInfo", noteInfoRoute);
app.use("/emploi", emploiRoutes);
app.use("/emploiexamens",emploiExamenRoutes );
app.use('/classe', classeRoutes);
app.use('/absences', absenceRoutes);
app.use('/api', conversationRoutes);
app.use('/matiere',matiereRoute);
app.use ('/devoir',devoirRoute);
app.use('/message',messageRoute)
// Connect to the database
const db = require("./app/models");

db.mongoose
  .connect(`mongodb://localhost:27017/Compus`)
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// Serve static files for uploads
app.use('/uploads', express.static(__dirname + '/back/public/upload'));

// 404 error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    msg: "Page not found"
  });
});

// Créer le serveur HTTP après l'initialisation de `app`
const server = http.createServer(app);
const io = socketConfig.init(server);

app.set("io", io);

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});