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
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(isomorphic-dompurify|@exodus|validator|node-fetch|undici|jsdom|html-encoding-sniffer|whatwg-url|whatwg-mimetype)/)',
    ],
};

module.exports = createJestConfig(customJestConfig);
