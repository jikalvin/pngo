// Global mocks for Jest testing environment

// Mock expo-router
jest.mock('expo-router', () => {
  const actualNav = jest.requireActual('expo-router');
  return {
    ...actualNav,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      navigate: jest.fn(),
    }),
    useLocalSearchParams: () => ({
      // Provide default mock params or allow override in tests
      id: 'test-id', 
      userType: 'user',
    }),
    router: { // Mock top-level router object
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        navigate: jest.fn(),
    },
    Link: jest.fn(({ href, children, ...props }) => {
        // Mock Link to be a Pressable or TouchableOpacity for interaction testing
        const React = require('react');
        const { TouchableOpacity } = require('react-native');
        return React.createElement(TouchableOpacity, { ...props, onPress: () => actualNav.router.push(href) }, children);
    }),
  };
});

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)), // Default to no token/data
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock for react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }), // Example frame
  };
});


// Mock i18next (react-i18next)
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key) => key, // Returns the key itself for simplicity
      i18n: {
        changeLanguage: jest.fn(() => new Promise(() => {})),
        language: 'en',
      },
    }),
  }));

// Mock lucide-react-native icons
// This is a basic mock. If specific icon names are needed, they can be added.
// Or mock individual icons as needed in specific tests.
jest.mock('lucide-react-native', () => {
    const React = require('react');
    const { View } = require('react-native');
    const createIcon = (name) => ({ size, color, style }) => {
      // console.log(`Mocked Lucide Icon: ${name}, Size: ${size}, Color: ${color}`);
      return React.createElement(View, { style: [{ width: size, height: size }, style], testID: `icon-${name}` });
    };
  
    return new Proxy({}, {
      get: (target, prop) => {
        if (prop === '__esModule') return false;
        return createIcon(prop);
      }
    });
  });

// Extend Jest matchers from @testing-library/jest-native
// This is now recommended to be done via setupFilesAfterEnv in jest.config.js
// and importing '@testing-library/jest-native/extend-expect'
// However, if @testing-library/jest-native is deprecated, we might not need this or use alternatives.
// For now, let's include it as it was installed.
require('@testing-library/jest-native/extend-expect');


// Suppress console.error and console.warn during tests to keep output clean
// You might want to disable this during debugging to see warnings/errors.
// global.console = {
//   ...console,
//   // log: jest.fn(), // if you want to suppress logs too
//   error: jest.fn(),
//   warn: jest.fn(),
// };

// If you have a global AuthContext, you might want to provide a mock wrapper for it here
// or in individual test files.
// jest.mock('@/context/AuthContext', () => ({
//   useAuth: () => ({
//     user: null, // Default mock user
//     token: null,
//     isLoading: false,
//     login: jest.fn(),
//     logout: jest.fn(),
//   }),
//   AuthProvider: jest.fn(({ children }) => children),
// }));

console.log('Frontend Jest setup complete.');
