const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ['user', 'admin', 'driver'], default: 'user' },
  // Fields for drivers/pickers
  availability: { type: Boolean, default: false }, // Is the driver available for new deliveries?
  earnings: { type: Number, default: 0 }, // Total earnings for the driver
  // Add any other user-related fields here
});

module.exports = mongoose.model('User', userSchema);
