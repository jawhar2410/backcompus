const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");

router.post("/", messageController.createMessage); 
router.get("/", messageController.getMessages); 
router.get("/conversations", messageController.getUsersConversation); 
module.exports = router;
