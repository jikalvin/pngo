const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  weight: { type: Number },
  dimensions: {
    width: { type: Number },
    height: { type: Number },
    depth: { type: Number },
  },
  pickupAddress: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  price: { type: Number, required: false }, // Assuming price is optional or can be set later
  status: { type: String, enum: ['pending', 'accepted', 'cancelled', 'completed', 'failed_delivery'], default: 'pending' },
  // Relationships
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Sender
  // delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' } // Link to the actual delivery instance
});

module.exports = mongoose.model('Package', packageSchema);
