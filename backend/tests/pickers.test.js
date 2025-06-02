const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const pickerRoutes = require('../routes/pickers'); // Make sure this path is correct
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const app = express();
app.use(express.json());
app.use('/api/pickers', pickerRoutes);

// Simplified middleware mock
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

describe('Picker API Endpoints', () => {
    let driverUser, adminUser, regularUser, driverToken, adminToken, regularUserToken;

    beforeAll(async () => {
        await User.deleteMany({});
        driverUser = await new User({ 
            username: 'pickeruser', 
            password: 'password', 
            role: 'driver', 
            earnings: 150.75, 
            availability: true 
        }).save();
        adminUser = await new User({ username: 'pickeradmin', password: 'password', role: 'admin' }).save();
        regularUser = await new User({ username: 'pickerregularuser', password: 'password', role: 'user' }).save();


        driverToken = jwt.sign({ user: { id: driverUser.id, role: driverUser.role } }, process.env.JWT_SECRET);
        adminToken = jwt.sign({ user: { id: adminUser.id, role: adminUser.role } }, process.env.JWT_SECRET);
        regularUserToken = jwt.sign({ user: { id: regularUser.id, role: regularUser.role } }, process.env.JWT_SECRET);
    });

    describe('GET /api/pickers/:id/earnings', () => {
        it('should allow a driver to fetch their own earnings', async () => {
            const res = await request(app)
                .get(`/api/pickers/${driverUser.id}/earnings`)
                .set('Authorization', `Bearer ${driverToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('username', driverUser.username);
            expect(res.body).toHaveProperty('earnings', driverUser.earnings);
        });

        it('should allow an admin to fetch a driver\'s earnings', async () => {
            const res = await request(app)
                .get(`/api/pickers/${driverUser.id}/earnings`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.earnings).toBe(driverUser.earnings);
        });

        it('should return 403 if a regular user tries to fetch another user\'s earnings', async () => {
            const res = await request(app)
                .get(`/api/pickers/${driverUser.id}/earnings`)
                .set('Authorization', `Bearer ${regularUserToken}`);
            expect(res.statusCode).toEqual(403);
        });
        
        it('should return 400 if the requested user is not a driver', async () => {
            const res = await request(app)
                .get(`/api/pickers/${regularUser.id}/earnings`) // Trying to get earnings of a 'user' role
                .set('Authorization', `Bearer ${adminToken}`); // Admin can view any user, but controller checks role
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('This user is not a driver/picker.');
        });

        it('should return 404 for a non-existent picker ID', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/pickers/${nonExistentId}/earnings`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/pickers/availability', () => {
        it('should allow a driver to update their own availability to false', async () => {
            expect(driverUser.availability).toBe(true); // Initial state
            const res = await request(app)
                .put(`/api/pickers/availability`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ availability: false });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.availability).toBe(false);
            const updatedDriver = await User.findById(driverUser.id);
            expect(updatedDriver.availability).toBe(false);
        });

        it('should allow a driver to update their own availability to true', async () => {
            // Set to false first
            driverUser.availability = false;
            await driverUser.save();

            const res = await request(app)
                .put(`/api/pickers/availability`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ availability: true });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.availability).toBe(true);
            const updatedDriver = await User.findById(driverUser.id);
            expect(updatedDriver.availability).toBe(true);
        });

        it('should return 403 if a non-driver tries to update availability', async () => {
            const res = await request(app)
                .put(`/api/pickers/availability`)
                .set('Authorization', `Bearer ${regularUserToken}`)
                .send({ availability: true });
            expect(res.statusCode).toEqual(403); // authorize('driver') should block
        });

        it('should return 400 if availability is not a boolean', async () => {
            const res = await request(app)
                .put(`/api/pickers/availability`)
                .set('Authorization', `Bearer ${driverToken}`)
                .send({ availability: 'not-a-boolean' });
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('Availability must be a boolean value (true or false)');
        });
    });
});
