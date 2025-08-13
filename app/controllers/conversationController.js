// /backend/controllers/conversationController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/user.model');

exports.createConversation = async (req, res) => {
  const { userId1, userId2 } = req.body;
  try {
    const newConversation = new Conversation({
      participants: [userId1, userId2]
    });
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.params.userId] }
    }).populate('participants', 'username');
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.addMessage = async (req, res) => {
  const { conversationId, senderId, text } = req.body;
  try {
    const newMessage = new Message({
      conversationId,
      sender: senderId,
      text
    });
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).populate('sender', 'username');
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};
