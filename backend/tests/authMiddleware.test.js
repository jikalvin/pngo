const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' });

// Setup a test app
const app = express();
app.use(express.json());

// Test user
let testUser, testAdmin, testToken, adminToken;

// Test routes
app.get('/api/test/protected', protect, (req, res) => res.status(200).json({ userId: req.user.id, role: req.user.role }));
app.get('/api/test/admin', protect, authorize('admin'), (req, res) => res.status(200).json({ message: 'Admin content' }));
app.get('/api/test/driver', protect, authorize('driver'), (req, res) => res.status(200).json({ message: 'Driver content' }));
app.get('/api/test/userOrAdmin', protect, authorize('user', 'admin'), (req, res) => res.status(200).json({ message: 'User or Admin content' }));


describe('Auth Middleware', () => {

  beforeAll(async () => {
    await User.deleteMany({});
    testUser = await new User({ username: 'middlewareuser', password: 'password', role: 'user' }).save();
    testAdmin = await new User({ username: 'middlewareadmin', password: 'password', role: 'admin' }).save();
    
    testToken = jwt.sign({ user: { id: testUser.id, role: testUser.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
    adminToken = jwt.sign({ user: { id: testAdmin.id, role: testAdmin.role } }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });
  
  describe('Protect Middleware', () => {
    it('should grant access if a valid token is provided', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.userId).toBe(testUser.id.toString());
      expect(res.body.role).toBe(testUser.role);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .get('/api/test/protected');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.msg).toBe('Not authorized, no token');
    });

    it('should return 401 if token is invalid (e.g., malformed)', async () => {
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'Bearer invalidtoken123');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.msg).toBe('Not authorized, token failed');
    });
    
    it('should return 401 if token is expired', async () => {
        const expiredToken = jwt.sign({ user: { id: testUser.id, role: testUser.role } }, process.env.JWT_SECRET, { expiresIn: '0s' });
        // Wait for a moment to ensure token is expired if expiresIn '0s' is too fast for system time.
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        const res = await request(app)
          .get('/api/test/protected')
          .set('Authorization', `Bearer ${expiredToken}`);
        
        expect(res.statusCode).toEqual(401);
        expect(res.body.msg).toBe('Not authorized, token failed'); // Or specific expiry message if jwt.verify differentiates
      });

    it('should return 401 if user in token does not exist in DB', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId().toString();
      const tokenWithNonExistentUser = jwt.sign({ user: { id: nonExistentUserId, role: 'user' } }, process.env.JWT_SECRET);
      
      const res = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${tokenWithNonExistentUser}`);
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.msg).toBe('Not authorized, user not found');
    });
  });

  describe('Authorize Middleware', () => {
    it('should grant access if user has the required role (admin)', async () => {
      const res = await request(app)
        .get('/api/test/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('Admin content');
    });

    it('should deny access if user does not have the required role (user trying admin route)', async () => {
      const res = await request(app)
        .get('/api/test/admin')
        .set('Authorization', `Bearer ${testToken}`); // testToken is for 'user' role
      
      expect(res.statusCode).toEqual(403);
      expect(res.body.msg).toContain('not authorized');
    });
    
    it('should grant access if user has one of the multiple allowed roles', async () => {
        const resUser = await request(app)
          .get('/api/test/userOrAdmin')
          .set('Authorization', `Bearer ${testToken}`); // User role
        expect(resUser.statusCode).toEqual(200);
  
        const resAdmin = await request(app)
          .get('/api/test/userOrAdmin')
          .set('Authorization', `Bearer ${adminToken}`); // Admin role
        expect(resAdmin.statusCode).toEqual(200);
      });

    it('should deny access if user role is not among multiple allowed roles', async () => {
        // Assuming 'driver' role is not in ['user', 'admin'] for '/api/test/userOrAdmin'
        const driverUser = await new User({ username: 'authDriver', password: 'password', role: 'driver' }).save();
        const driverToken = jwt.sign({ user: { id: driverUser.id, role: driverUser.role } }, process.env.JWT_SECRET);
        
        const res = await request(app)
          .get('/api/test/userOrAdmin')
          .set('Authorization', `Bearer ${driverToken}`);
        expect(res.statusCode).toEqual(403);
    });

    it('should deny access if protect middleware fails (no token for authorize)', async () => {
        // This tests the composition of protect + authorize
        const res = await request(app)
          .get('/api/test/admin'); // No token
        expect(res.statusCode).toEqual(401); // protect should deny first
      });
  });
});
