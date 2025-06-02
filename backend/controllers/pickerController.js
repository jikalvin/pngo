const User = require('../models/User');

// @desc    Get picker's earnings
// @route   GET /api/pickers/:id/earnings
// @access  Private (self or admin)
exports.getPickerEarnings = async (req, res) => {
  try {
    const pickerId = req.params.id;

    // Ensure user is requesting their own earnings or is an admin
    if (req.user.role !== 'admin' && req.user.id !== pickerId) {
      return res.status(403).json({ msg: 'Not authorized to view these earnings' });
    }

    const picker = await User.findById(pickerId).select('username earnings role');
    if (!picker) {
      return res.status(404).json({ msg: 'Picker not found' });
    }

    if (picker.role !== 'driver') {
        return res.status(400).json({ msg: 'This user is not a driver/picker.' });
    }

    res.json({ username: picker.username, earnings: picker.earnings });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Picker not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Toggle picker's availability
// @route   PUT /api/pickers/availability  (Changed from /:id/availability to operate on logged-in user)
// @access  Private (driver role)
exports.toggleAvailability = async (req, res) => {
  const { availability } = req.body;

  if (typeof availability !== 'boolean') {
    return res.status(400).json({ msg: 'Availability must be a boolean value (true or false)' });
  }

  try {
    // req.user is populated by 'protect' middleware
    const picker = await User.findById(req.user.id);

    if (!picker || picker.role !== 'driver') {
      // This should not happen if authorize('driver') middleware is effective
      return res.status(404).json({ msg: 'Picker not found or user is not a driver' });
    }

    picker.availability = availability;
    await picker.save();

    res.json({ 
      msg: `Availability updated to ${availability}`, 
      username: picker.username, 
      availability: picker.availability 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
