const mongoose = require("mongoose");

const CertifSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  responsable: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  schedule: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Certif", CertifSchema);
