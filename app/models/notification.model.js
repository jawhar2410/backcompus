// Notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  type: {
    type: String,
    enum: ["info", "warning", "alert", "success"],
    default: "info",
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String, // Lien vers la ressource concernée (ex: un cours, un devoir, etc.)
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);