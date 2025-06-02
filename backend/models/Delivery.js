const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  pickup_location: { type: String, required: true },
  dropoff_location: { type: String, required: true },
  status: { type: String, enum: ['pending', 'assigned', 'in-transit', 'delivered', 'failed'], default: 'pending' },
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', nullable: true }, // Assigned driver
  pickup_time: { type: Date },
  delivery_time: { type: Date },
  // Add any other delivery-specific fields here (e.g., signature, proof of delivery)
});

module.exports = mongoose.model('Delivery', deliverySchema);
