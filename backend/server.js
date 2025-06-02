const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Delivery App Backend');
});

// Import routes
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const deliveryRoutes = require('./routes/deliveries');
const pickerRoutes = require('./routes/pickers');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/pickers', pickerRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
