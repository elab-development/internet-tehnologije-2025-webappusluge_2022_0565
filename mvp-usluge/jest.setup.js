// Import Jest DOM matchers
import '@testing-library/jest-dom';
const { TextEncoder, TextDecoder } = require('util');

// Polyfill Web APIs for Node.js environment in tests
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

// Polyfill Request, Response, Headers (Web APIs needed for Next.js route handlers)
if (typeof global.Request === 'undefined') {
    const fetch = require('node-fetch');
    global.Request = fetch.Request;
    global.Response = fetch.Response;
    global.Headers = fetch.Headers;
    global.fetch = fetch;

    // Polyfill Response.json
    if (typeof global.Response.json !== 'function') {
        global.Response.json = (data, init) => {
            const body = JSON.stringify(data);
            const headers = new global.Headers(init?.headers);
            if (!headers.has('content-type')) {
                headers.set('content-type', 'application/json');
            }
            return new global.Response(body, {
                ...init,
                headers,
            });
        };
    }
}

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            pathname: '/',
            query: {},
            asPath: '/',
        };
    },
    useSearchParams() {
        return new URLSearchParams();
    },
    usePathname() {
        return '/';
    },
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => ({
        data: null,
        status: 'unauthenticated',
    })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    SessionProvider: ({ children }) => children,
}));

// Suppress console errors in tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
