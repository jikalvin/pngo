const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/auth');
const User = require('../models/User'); // Adjust path as necessary
const dotenv = require('dotenv');

dotenv.config({ path: '.env.test' }); // Load test environment variables if you have a specific .env for tests

// Setup a minimal Express app for testing routes
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// If your main app file (server.js) exports the app, you can import it directly:
// const app = require('../server'); // This is often preferred

describe('Auth API Endpoints', () => {
  // User data for testing
  const testUser = {
    username: 'testuser',
    password: 'password123',
    role: 'user',
  };
  const testAdminUser = {
    username: 'testadmin',
    password: 'password123',
    role: 'admin',
  };

  beforeEach(async () => {
    // Clear User collection before each test related to auth
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('msg', 'User registered successfully');

      const savedUser = await User.findOne({ username: testUser.username });
      expect(savedUser).not.toBeNull();
      expect(savedUser.username).toBe(testUser.username);
    });

    it('should not register a user with an existing username', async () => {
      // First, register the user
      await request(app).post('/api/auth/register').send(testUser);
      
      // Then, try to register again with the same username
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'User already exists');
    });

    it('should hash the password before saving', async () => {
        await request(app)
          .post('/api/auth/register')
          .send(testUser);
        const savedUser = await User.findOne({ username: testUser.username });
        expect(savedUser.password).not.toBe(testUser.password);
      });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.role).toBe(testUser.role);
    });

    it('should not login with an incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'Invalid credentials');
    });

    it('should not login a non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'Invalid credentials');
    });
  });
});

// It's good practice to close the mongoose connection if it's not handled by jest.setup.js for individual test files
// However, since jest.setup.js handles global beforeAll/afterAll for mongoose, this might not be needed here.
// If tests were run in parallel without a global setup, each file would need its own.
// afterAll(async () => {
//   await mongoose.connection.close();
// });
