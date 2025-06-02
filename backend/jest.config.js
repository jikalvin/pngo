module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000, // Increased timeout for MongoDB Memory Server
  setupFilesAfterEnv: ['./jest.setup.js'], // if we create a setup file for DB connection
  modulePathIgnorePatterns: ["<rootDir>/frontend/"] // Ignore frontend if it's in a subdir
};
