const socketIo = require("socket.io");
const Message = require("./app/models/Message");

let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log(`🟢 Utilisateur connecté: ${socket.id}`);

      // Écouter un message envoyé par un client
      socket.on("sendMessage", async (messageData) => {
        console.log("📩 Message reçu:", messageData);

        try {
          const newMessage = new Message({
            sender: messageData.sender,
            receiver: messageData.receiver,
            text: messageData.text,
          });

          const savedMessage = await newMessage.save();

          // Envoyer le message stocké à tous les clients
          io.emit("receiveMessage", savedMessage);
        } catch (error) {
          console.error("❌ Erreur lors de l'enregistrement du message :", error);
        }
      });

      socket.on("disconnect", () => {
        console.log(`🔴 Utilisateur déconnecté: ${socket.id}`);
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io non initialisé !");
    }
    return io;
  },
};
