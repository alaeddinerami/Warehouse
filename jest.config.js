module.exports = {
    preset: 'jest-expo',
    setupFiles: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '^~/(.*)$': '<rootDir>/$1',
    },
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
    ],
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)']
  };