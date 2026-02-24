/**
 * Integration test za /api/auth/register
 * Koristi mock Prisma klijenta
 */

// Mock dependencies
jest.mock('@/lib/db/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));
jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
}));
jest.mock('@/lib/email', () => ({
    sendWelcomeEmail: jest.fn(),
}));
jest.mock('@/lib/rate-limit', () => ({
    applyRateLimit: jest.fn(),
    authRateLimit: {},
}));

import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcryptjs';

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        // Mock rate limit (allow request)
        const { applyRateLimit } = require('@/lib/rate-limit');
        applyRateLimit.mockResolvedValue({ success: true });

        // Mock Prisma findUnique (user doesn't exist)
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        // Mock bcrypt hash
        (hash as jest.Mock).mockResolvedValue('hashed_password');

        // Mock Prisma create
        const mockUser = {
            id: '123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'CLIENT',
            isVerified: false,
            createdAt: new Date(),
        };
        (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

        // Mock email
        const { sendWelcomeEmail } = require('@/lib/email');
        sendWelcomeEmail.mockResolvedValue({ success: true });

        // Create request
        const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                role: 'CLIENT',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.email).toBe('test@example.com');
        expect(sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should reject registration with existing email', async () => {
        // Mock rate limit
        const { applyRateLimit } = require('@/lib/rate-limit');
        applyRateLimit.mockResolvedValue({ success: true });

        // Mock Prisma findUnique (user exists)
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            id: '123',
            email: 'existing@example.com',
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.success).toBe(false);
        expect(data.error).toContain('već registrovana');
    });

    it('should reject registration with invalid data', async () => {
        // Mock rate limit
        const { applyRateLimit } = require('@/lib/rate-limit');
        applyRateLimit.mockResolvedValue({ success: true });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'invalid-email', // Invalid email
                password: '123', // Too short
                firstName: 'T', // Too short
                lastName: 'U', // Too short
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(422);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Validaciona greška');
    });

    it('should reject when rate limit exceeded', async () => {
        // Mock rate limit (deny request)
        const { applyRateLimit } = require('@/lib/rate-limit');
        const mockResponse = new Response(
            JSON.stringify({ success: false, error: 'Too many requests' }),
            { status: 429 }
        );
        applyRateLimit.mockResolvedValue({
            success: false,
            response: mockResponse
        });

        const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
            }),
        });

        const response = await POST(request);

        expect(response.status).toBe(429);
    });
});
