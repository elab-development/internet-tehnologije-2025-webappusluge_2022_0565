// 🔧 VERCEL FIX: Only load next/jest during testing, not during build
// This prevents test dependencies (jsdom, etc) from being included in production
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined) {
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
            'node_modules/(?!(@exodus/bytes|html-encoding-sniffer|whatwg-url|jsdom|isomorphic-dompurify|tr46|webidl-conversions|uncrypto|@upstash)/)',
        ],
        coveragePathIgnorePatterns: ['/node_modules/'],
    };

    module.exports = createJestConfig(customJestConfig);
} else {
    // Return empty config during build
    module.exports = {};
}