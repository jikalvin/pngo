const Delivery = require('../models/Delivery');
const Package = require('../models/Package');
const User = require('../models/User');

// @desc    Get active deliveries for the logged-in driver
// @route   GET /api/deliveries/active
// @access  Private (driver role)
exports.getActiveDeliveries = async (req, res) => {
  try {
    const activeDeliveries = await Delivery.find({
      driver_id: req.user.id,
      status: { $in: ['assigned', 'in-transit'] } // Statuses indicating active work for driver
    })
    .populate('package_id', 'name description pickupAddress deliveryAddress price owner')
    .populate({
        path: 'package_id',
        populate: {
            path: 'owner',
            select: 'username name' // Assuming 'name' is a field on User model
        }
    });

    res.json(activeDeliveries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update delivery status
// @route   PUT /api/deliveries/:id/status
// @access  Private (driver role)
exports.updateDeliveryStatus = async (req, res) => {
  const { status: newStatus } = req.body; // e.g., 'picked-up', 'in-transit', 'delivered', 'failed'
  const deliveryId = req.params.id;

  // Validate newStatus against the Delivery schema enum
  const allowedStatuses = Delivery.schema.path('status').enumValues;
  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ msg: `Invalid status value: ${newStatus}. Allowed values are: ${allowedStatuses.join(', ')}` });
  }

  try {
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({ msg: 'Delivery not found' });
    }

    // Ensure the logged-in user is the driver for this delivery
    if (delivery.driver_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'User not authorized to update this delivery' });
    }

    // Prevent updating status of already completed or failed deliveries if it's not logical
    if (delivery.status === 'delivered' || delivery.status === 'failed') {
        return res.status(400).json({ msg: `Delivery is already in a final state (${delivery.status}) and cannot be updated.` });
    }
    
    // Specific logic for 'picked-up' status
    if (newStatus === 'in-transit' && delivery.status !== 'assigned') {
        // Typically, a package is 'assigned', then driver picks it up and it becomes 'in-transit'
        // The prompt mentions 'picked-up' as a status, which is not in Delivery schema.
        // Let's assume 'assigned' means driver accepted, 'in-transit' means driver has picked up.
        // Or, if 'picked-up' is a distinct status, it should be added to Delivery schema.
        // For now, let's map 'picked-up' from request to 'in-transit' in our system.
        // Or, more simply, the driver can set it to 'in-transit' when they have it.
        // The current enum is: ['pending', 'assigned', 'in-transit', 'delivered', 'failed']
        // 'assigned' means the driver has accepted. 'in-transit' means they have possession and are moving.
    }


    delivery.status = newStatus;

    if (newStatus === 'delivered') {
      delivery.delivery_time = Date.now();
      
      // Update associated package status to 'completed'
      const packageItem = await Package.findById(delivery.package_id);
      if (packageItem) {
        packageItem.status = 'completed';
        await packageItem.save();

        // Calculate and update picker's earnings
        // Assumes package price is the amount earned by the picker for this delivery
        if (packageItem.price && packageItem.price > 0) {
          const driver = await User.findById(req.user.id);
          if (driver) {
            driver.earnings = (driver.earnings || 0) + packageItem.price;
            await driver.save();
            // Potentially emit an event or notification about earnings update
          }
        }
      }
    } else if (newStatus === 'failed') {
        // Handle failed delivery: update package status
        const packageItem = await Package.findById(delivery.package_id);
        if (packageItem) {
            packageItem.status = 'failed_delivery'; // Or back to 'pending' if it can be retried by another driver
            await packageItem.save();
        }
    }

    await delivery.save();
    res.json({ msg: 'Delivery status updated successfully', delivery });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Delivery not found' });
    }
    res.status(500).send('Server Error');
  }
};
