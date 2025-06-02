const Package = require('../models/Package');
const Delivery = require('../models/Delivery');
const User = require('../models/User'); // Needed for associating sender/picker

// @desc    Create a new package
// @route   POST /api/packages
// @access  Private (User role - sender)
exports.createPackage = async (req, res) => {
  const { name, description, weight, dimensions, pickupAddress, deliveryAddress, price } = req.body;

  if (!name || !pickupAddress || !deliveryAddress) {
    return res.status(400).json({ msg: 'Please provide name, pickupAddress, and deliveryAddress' });
  }

  try {
    const newPackage = new Package({
      name,
      description,
      weight,
      dimensions,
      pickupAddress,
      deliveryAddress,
      price,
      owner: req.user.id, // Sender is the logged-in user
      status: 'pending', // Default, but explicit
    });

    const savedPackage = await newPackage.save();
    res.status(201).json(savedPackage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get available packages for pickers
// @route   GET /api/packages/available
// @access  Private (Picker role - e.g. 'driver')
exports.getAvailablePackages = async (req, res) => {
  try {
    const availablePackages = await Package.find({ status: 'pending' })
                                         .populate('owner', 'username name') // Assuming 'name' field exists on User
                                         .sort({ createdAt: -1 }); // Show newest first
    res.json(availablePackages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get package details by ID
// @route   GET /api/packages/:id
// @access  Private (User or Picker)
exports.getPackageById = async (req, res) => {
  try {
    const packageItem = await Package.findById(req.params.id).populate('owner', 'username');

    if (!packageItem) {
      return res.status(404).json({ msg: 'Package not found' });
    }

    // Optional: Check if the user is the owner or an admin/driver if more specific access is needed
    // For now, any authenticated user can see any package by ID.

    res.json(packageItem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Package not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Accept a package (by a picker/driver)
// @route   PUT /api/packages/:id/accept
// @access  Private (Picker role - e.g. 'driver')
exports.acceptPackage = async (req, res) => {
  try {
    const packageItem = await Package.findById(req.params.id);
    if (!packageItem) {
      return res.status(404).json({ msg: 'Package not found' });
    }

    if (packageItem.status !== 'pending') {
      return res.status(400).json({ msg: `Package is not available for acceptance. Current status: ${packageItem.status}` });
    }

    // Double check if package is already actively associated with a delivery (should be redundant if status is 'pending')
    const existingDelivery = await Delivery.findOne({ package_id: req.params.id, status: { $in: ['assigned', 'in-transit'] } });
    if (existingDelivery) {
      // This case should ideally not be hit if package status is managed correctly
      packageItem.status = 'accepted'; // Corrective action
      await packageItem.save();
      return res.status(400).json({ msg: 'Package is already actively associated with a delivery. Status has been corrected.', delivery_id: existingDelivery._id });
    }

    // Create a new delivery entry using package details
    const newDelivery = new Delivery({
      package_id: packageItem._id,
      driver_id: req.user.id, // Logged-in driver
      status: 'assigned', // Driver has been assigned, ready for pickup
      pickup_location: packageItem.pickupAddress, // Comes from the package
      dropoff_location: packageItem.deliveryAddress, // Comes from the package
      // pickup_time, delivery_time will be updated by driver actions later
    });

    await newDelivery.save();

    // Update the package status to 'accepted'
    packageItem.status = 'accepted';
    await packageItem.save();

    res.status(200).json({ msg: 'Package accepted and delivery created', delivery: newDelivery, package: packageItem });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Package not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Reject a package (by a picker/driver)
// @route   PUT /api/packages/:id/reject
// @access  Private (Picker role - e.g. 'driver')
exports.rejectPackage = async (req, res) => {
  try {
    const packageItem = await Package.findById(req.params.id);
    if (!packageItem) {
      return res.status(404).json({ msg: 'Package not found' });
    }

    // What does "reject" mean?
    // 1. If it means a driver looked at it and decided not to take it:
    //    - We might log this action.
    //    - The package remains "available" for other drivers.
    //    - No change to Delivery collection as one hasn't been created for this driver.
    // 2. If the package was already "assigned" to this driver and now they reject:
    //    - This is more like "unassigning" or "cancelling" the driver's commitment.
    //    - The associated Delivery entry might need its status updated (e.g., to 'pending' or 'failed_assignment').
    //    - The package might become available again.

    // For now, let's assume scenario 1: a driver rejects picking an available package.
    // In this case, no specific database action is taken on the package or delivery.
    // We can log this event if a logging system was in place.
    // If the package had a status like 'pending_driver_confirmation', we might revert it.

    // Let's make a simple assumption: rejecting means the driver simply doesn't proceed.
    // If the package was somehow "soft-assigned" or "view-locked", this would release it.
    // Since our current "available" logic is "not in Deliveries", this means no action needed here
    // to make it available again, as it never made it into Deliveries with this driver.

    // TODO: Clarify the business logic for "reject".
    // For now, we'll just return a message. This means the driver chose not to accept it from the available list.
    // If the package status was 'pending', it remains 'pending'.
    // No change to the package or creation of a delivery record if it was never accepted.
    console.log(`Driver ${req.user.username} (ID: ${req.user.id}) viewed and chose not to accept/reject package ${req.params.id}`);
    res.json({ msg: 'Package rejection noted. Package remains in its current state unless it was accepted by this driver.' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Package not found' });
    }
    res.status(500).send('Server Error');
  }
};
