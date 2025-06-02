const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const deliveryRoutes = require('../routes/deliveries');
const Package = require('../models/Package');
const User = require('../models/User');
const Delivery = require('../models/Delivery');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const app = express();
app.use(express.json());
app.use('/api/deliveries', deliveryRoutes);

// Simplified middleware mock for testing routes directly (similar to packages.test.js)
// The actual protect/authorize middleware attached to routes will be tested.
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user;
        } catch (err) { /* invalid token */ }
    }
    next();
});


describe('Delivery API Endpoints', () => {
    let senderUser, driverUser, otherDriverUser, senderToken, driverToken, otherDriverToken;
    let packageForDelivery, activeDelivery, completedDelivery;

    beforeAll(async () => {
        await User.deleteMany({});
        senderUser = await new User({ username: 'deliverysender', password: 'password', role: 'user' }).save();
        driverUser = await new User({ username: 'deliverydriver', password: 'password', role: 'driver', earnings: 0 }).save();
        otherDriverUser = await new User({ username: 'otherdriver', password: 'password', role: 'driver' }).save();

        senderToken = jwt.sign({ user: { id: senderUser.id, role: senderUser.role } }, process.env.JWT_SECRET);
        driverToken = jwt.sign({ user: { id: driverUser.id, role: driverUser.role } }, process.env.JWT_SECRET);
        otherDriverToken = jwt.sign({ user: { id: otherDriverUser.id, role: otherDriverUser.role } }, process.env.JWT_SECRET);
    });

    beforeEach(async () => {
        await Package.deleteMany({});
        await Delivery.deleteMany({});
        await User.updateOne({ _id: driverUser.id }, { $set: { earnings: 0 } }); // Reset earnings for driver

        packageForDelivery = await new Package({
            name: 'Delivery Test Package',
            pickupAddress: 'Pickup Loc',
            deliveryAddress: 'Dropoff Loc',
            owner: senderUser.id,
            status: 'accepted', // Pre-accepted for some tests
            price: 50 
        }).save();

        activeDelivery = await new Delivery({
            package_id: packageForDelivery._id,
            driver_id: driverUser.id,
            status: 'assigned', // or 'in-transit'
            pickup_location: packageForDelivery.pickupAddress,
            dropoff_location: packageForDelivery.deliveryAddress,
        }).save();
        
        // A package for a completed delivery scenario
        let completedPackage = await new Package({
            name: 'Completed Package', pickupAddress: 'Old Loc', deliveryAddress: 'New Loc', owner: senderUser.id, status: 'completed', price: 30
        }).save();
        completedDelivery = await new Delivery({
            package_id: completedPackage._id, driver_id: driverUser.id, status: 'delivered', pickup_location: 'Old Loc', dropoff_location: 'New Loc'
        }).save();
    });

    describe('GET /api/deliveries/active', () => {
        it('should fetch active deliveries for the logged-in driver', async () => {
            const res = await request(app)
                .get('/api/deliveries/active')
                .set('Authorization', `Bearer ${driverToken}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1); // Only 'activeDelivery' should be fetched
            expect(res.body[0]._id.toString()).toBe(activeDelivery._id.toString());
            expect(res.body[0].status).toBe('assigned');
        });

        it('should return 403 if a non-driver tries to fetch active deliveries', async () => {
            const res = await request(app)
                .get('/api/deliveries/active')
                .set('Authorization', `Bearer ${senderToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('PUT /api/deliveries/:id/status', () => {
        it('should allow a driver to update their delivery status to in-transit', async () => {
            expect(activeDelivery.status).toBe('assigned'); // Initial status
            const res = await request(app)
                .put(`/api/deliveries/${activeDelivery._id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'in-transit' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.delivery.status).toBe('in-transit');
            const dbDelivery = await Delivery.findById(activeDelivery._id);
            expect(dbDelivery.status).toBe('in-transit');
        });

        it('should allow a driver to update their delivery status to delivered and update earnings', async () => {
            activeDelivery.status = 'in-transit'; // Set to in-transit before delivering
            await activeDelivery.save();
            
            const initialDriver = await User.findById(driverUser.id);
            expect(initialDriver.earnings).toBe(0);

            const res = await request(app)
                .put(`/api/deliveries/${activeDelivery._id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'delivered' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.delivery.status).toBe('delivered');
            expect(res.body.delivery).toHaveProperty('delivery_time');

            const dbDelivery = await Delivery.findById(activeDelivery._id);
            expect(dbDelivery.status).toBe('delivered');

            const dbPackage = await Package.findById(packageForDelivery._id);
            expect(dbPackage.status).toBe('completed');
            
            const updatedDriver = await User.findById(driverUser.id);
            expect(updatedDriver.earnings).toBe(packageForDelivery.price); // 50
        });
        
        it('should allow a driver to update their delivery status to failed', async () => {
            const res = await request(app)
                .put(`/api/deliveries/${activeDelivery._id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'failed' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.delivery.status).toBe('failed');
            const dbPackage = await Package.findById(packageForDelivery._id);
            expect(dbPackage.status).toBe('failed_delivery');
        });

        it('should not allow a driver to update a delivery not assigned to them', async () => {
            const res = await request(app)
                .put(`/api/deliveries/${activeDelivery._id}/status`)
                .set('Authorization', `Bearer ${otherDriverToken}`) // Different driver
                .send({ status: 'in-transit' });
            expect(res.statusCode).toEqual(403);
        });

        it('should return 400 for an invalid status value', async () => {
            const res = await request(app)
                .put(`/api/deliveries/${activeDelivery._id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'invalid_status_value' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toContain('Invalid status value');
        });

        it('should not update a delivery already in a final state (delivered)', async () => {
            const res = await request(app)
                .put(`/api/deliveries/${completedDelivery._id}/status`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ status: 'in-transit' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toContain('already in a final state');
        });
    });
});
