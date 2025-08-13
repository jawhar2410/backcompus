const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricing.controller');

router.post('/pricing/new', pricingController.addPricing);
router.get('/pricings', pricingController.getAllPricings);
router.put('/pricing/:id', pricingController.updatePricing);
router.delete('/pricing/:id', pricingController.deletePricing);

module.exports = router;
