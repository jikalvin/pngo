const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const packageRoutes = require('../routes/packages');
const Package = require('../models/Package');
const User = require('../models/User');
const Delivery = require('../models/Delivery'); 
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

const app = express();
app.use(express.json());
app.use('/api/packages', packageRoutes); 
// Middleware stubs for protect and authorize - This is a simplified way.
// For more robust testing of middleware, test them separately or use a more complex setup.
// This mock assumes that if a token is provided and valid (decodable), req.user is set.
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user; // Attach user payload { id, role } to req
        } catch (err) {
            // Invalid token, req.user remains undefined
            console.log("Mock middleware: Invalid token in test");
        }
    }
    next();
});


describe('Package API Endpoints', () => {
    let senderUser, driverUser, senderToken, driverToken;
    let testPackage;

    beforeAll(async () => {
        // Create test users and tokens
        await User.deleteMany({});
        senderUser = await new User({ username: 'sender', password: 'password', role: 'user' }).save();
        driverUser = await new User({ username: 'driver', password: 'password', role: 'driver' }).save();

        senderToken = jwt.sign({ user: { id: senderUser.id, role: senderUser.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
        driverToken = jwt.sign({ user: { id: driverUser.id, role: driverUser.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    beforeEach(async () => {
        // Clear Package and Delivery collections before each test
        await Package.deleteMany({});
        await Delivery.deleteMany({});

        // Create a sample package for tests that need an existing package
        testPackage = await new Package({
            name: 'Sample Package for GET',
            description: 'Test description',
            pickupAddress: '123 Pickup St',
            deliveryAddress: '456 Dropoff Ave',
            owner: senderUser.id,
            status: 'pending',
            price: 10
        }).save();
    });

    describe('POST /api/packages', () => {
        it('should create a new package for an authenticated sender', async () => {
            const newPackageData = {
                name: 'New Test Package',
                description: 'A package created by a sender.',
                pickupAddress: '789 Sender Blvd',
                deliveryAddress: '101 Receiver Rd',
                price: 20,
            };
            const res = await request(app)
                .post('/api/packages')
                .set('Authorization', `Bearer ${senderToken}`)
                .send(newPackageData);
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('name', newPackageData.name);
            expect(res.body).toHaveProperty('owner', senderUser.id.toString());
            expect(res.body).toHaveProperty('status', 'pending');

            const dbPackage = await Package.findById(res.body._id);
            expect(dbPackage).not.toBeNull();
        });

        it('should return 403 if a driver tries to create a package', async () => {
             const newPackageData = { name: 'Driver Package', pickupAddress: 'Addr1', deliveryAddress: 'Addr2' };
             const res = await request(app)
                .post('/api/packages')
                .set('Authorization', `Bearer ${driverToken}`) // Driver token
                .send(newPackageData);
            expect(res.statusCode).toEqual(403); // authorize middleware should block this
         });

        it('should return 401 if no token is provided', async () => {
            const newPackageData = { name: 'No Auth Package', pickupAddress: 'Addr1', deliveryAddress: 'Addr2' };
            const res = await request(app)
                .post('/api/packages')
                .send(newPackageData);
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/packages/available', () => {
        it('should return available packages for an authenticated driver', async () => {
            // testPackage created in beforeEach is 'pending'
            const res = await request(app)
                .get('/api/packages/available')
                .set('Authorization', `Bearer ${driverToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].name).toBe('Sample Package for GET');
            expect(res.body[0].status).toBe('pending');
        });

        it('should return 403 if a sender tries to get available packages', async () => {
            const res = await request(app)
               .get('/api/packages/available')
               .set('Authorization', `Bearer ${senderToken}`); // Sender token
           expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/packages/:id', () => {
        it('should fetch a specific package by ID for an authenticated user', async () => {
            const res = await request(app)
                .get(`/api/packages/${testPackage._id}`)
                .set('Authorization', `Bearer ${senderToken}`); // Sender or Driver can fetch

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('name', testPackage.name);
        });

        it('should return 404 for a non-existent package ID', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/packages/${nonExistentId}`)
                .set('Authorization', `Bearer ${senderToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/packages/:id/accept', () => {
        it('should allow a driver to accept a pending package', async () => {
            const res = await request(app)
                .put(`/api/packages/${testPackage._id}/accept`)
                .set('Authorization', `Bearer ${driverToken}`);
            
            expect(res.statusCode).toEqual(200); // Changed from 201 to 200 as per controller update
            expect(res.body).toHaveProperty('msg', 'Package accepted and delivery created');
            expect(res.body.package.status).toBe('accepted');
            expect(res.body.delivery.package_id.toString()).toBe(testPackage._id.toString());
            expect(res.body.delivery.driver_id.toString()).toBe(driverUser.id.toString());
            expect(res.body.delivery.status).toBe('assigned');

            const updatedPackage = await Package.findById(testPackage._id);
            expect(updatedPackage.status).toBe('accepted');

            const delivery = await Delivery.findOne({ package_id: testPackage._id });
            expect(delivery).not.toBeNull();
            expect(delivery.driver_id.toString()).toBe(driverUser.id.toString());
        });

        it('should return 403 if a sender tries to accept a package', async () => {
            const res = await request(app)
                .put(`/api/packages/${testPackage._id}/accept`)
                .set('Authorization', `Bearer ${senderToken}`);
            expect(res.statusCode).toEqual(403);
        });

        it('should return 400 if package is not pending', async () => {
            testPackage.status = 'accepted';
            await testPackage.save();
            const res = await request(app)
                .put(`/api/packages/${testPackage._id}/accept`)
                .set('Authorization', `Bearer ${driverToken}`);
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toContain('not available for acceptance');
        });
    });

    describe('PUT /api/packages/:id/reject', () => {
        it('should allow a driver to reject a package (currently a no-op on DB for pending packages)', async () => {
            const res = await request(app)
                .put(`/api/packages/${testPackage._id}/reject`)
                .set('Authorization', `Bearer ${driverToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('msg', 'Package rejection noted. Package remains in its current state unless it was accepted by this driver.');
            
            const pkgUnchanged = await Package.findById(testPackage._id);
            expect(pkgUnchanged.status).toBe('pending'); // Status should remain 'pending'
        });
    });
});
