const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/deliveries/active
// @desc    Get active deliveries for the logged-in driver
// @access  Private (driver role)
router.get('/active', protect, authorize('driver'), deliveryController.getActiveDeliveries);

// @route   PUT /api/deliveries/:id/status
// @desc    Update delivery status
// @access  Private (driver role)
router.put('/:id/status', protect, authorize('driver'), deliveryController.updateDeliveryStatus);

module.exports = router;
