const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true, // Mettez à true si la description est obligatoire
  }
});

module.exports = mongoose.model('Pricing', PricingSchema);
