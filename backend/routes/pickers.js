const express = require('express');
const router = express.Router();
const pickerController = require('../controllers/pickerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/pickers/:id/earnings
// @desc    Get picker's earnings (admin or self)
// @access  Private
router.get('/:id/earnings', protect, pickerController.getPickerEarnings);

// @route   PUT /api/pickers/availability
// @desc    Toggle picker's own availability
// @access  Private (driver role)
router.put('/availability', protect, authorize('driver'), pickerController.toggleAvailability); // Driver updates their own availability

module.exports = router;
