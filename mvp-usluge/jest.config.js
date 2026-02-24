const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },

    transformIgnorePatterns: [
        'node_modules/(?!(@exodus/bytes|html-encoding-sniffer|whatwg-url|jsdom|isomorphic-dompurify|tr46|webidl-conversions)/)',
    ],

    coveragePathIgnorePatterns: ['/node_modules/'],
};

module.exports = createJestConfig(customJestConfig);