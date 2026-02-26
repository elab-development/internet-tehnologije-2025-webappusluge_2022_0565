const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    // 🔧 VERCEL FIX: Only load setup file during testing, not during build
    setupFilesAfterEnv: process.env.NODE_ENV === 'test' ? ['<rootDir>/jest.setup.js'] : [],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    // 🔧 VERCEL FIX: Simplified transformIgnorePatterns for production builds
    transformIgnorePatterns: process.env.NODE_ENV === 'test'
        ? ['node_modules/(?!(@exodus/bytes|html-encoding-sniffer|whatwg-url|jsdom|isomorphic-dompurify|tr46|webidl-conversions)/)']
        : ['node_modules/'],

    coveragePathIgnorePatterns: ['/node_modules/'],
};

module.exports = createJestConfig(customJestConfig);