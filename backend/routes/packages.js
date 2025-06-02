const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @route   POST /api/packages
// @desc    Create a new package
// @access  Private (User role - sender)
router.post('/', protect, authorize('user'), packageController.createPackage); // Assuming 'user' role is for senders

// @route   GET /api/packages/available
// @desc    Get available packages for pickers
// @access  Private (Picker role - e.g. 'driver')
router.get('/available', protect, authorize('driver'), packageController.getAvailablePackages); // Assuming 'driver' role is for pickers

// @route   GET /api/packages/:id
// @desc    Get package details by ID
// @access  Private (User or Picker)
router.get('/:id', protect, packageController.getPackageById);

// @route   PUT /api/packages/:id/accept
// @desc    Accept a package (by a picker)
// @access  Private (Picker role - e.g. 'driver')
router.put('/:id/accept', protect, authorize('driver'), packageController.acceptPackage);

// @route   PUT /api/packages/:id/reject
// @desc    Reject a package (by a picker)
// @access  Private (Picker role - e.g. 'driver')
router.put('/:id/reject', protect, authorize('driver'), packageController.rejectPackage);


module.exports = router;
