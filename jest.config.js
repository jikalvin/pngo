module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'], // Points to the global mocks and RTL Native extend-expect
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
  moduleNameMapper: {
    // For handling aliases like @/components, @/constants, etc.
    // You might need to adjust these based on your tsconfig.json or babel.config.js
    '^@/(.*)$': '<rootDir>/$1', 
    // If 'app' is a top-level source like 'components', also map it:
    // '^app/(.*)$': '<rootDir>/app/$1', // Already default if 'app' is in root
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
};
