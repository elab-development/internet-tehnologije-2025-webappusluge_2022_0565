/**
 * Integration test za /api/services
 * Koristi mock Prisma klijenta
 */

// Mock dependencies
jest.mock('@/lib/db/prisma', () => ({
    prisma: {
        service: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
        },
        category: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/lib/auth-helpers', () => ({
    getCurrentUser: jest.fn(),
}));

import { GET, POST } from '@/app/api/services/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';

describe('/api/services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('should return services with pagination', async () => {
            const mockServices = [
                { id: '1', name: 'Service 1', provider: { id: 'p1' }, category: { id: 'c1' } },
                { id: '2', name: 'Service 2', provider: { id: 'p1' }, category: { id: 'c1' } },
            ];

            (prisma.service.findMany as jest.Mock).mockResolvedValue(mockServices);
            (prisma.service.count as jest.Mock).mockResolvedValue(2);

            const request = new NextRequest('http://localhost:3000/api/services?page=1&limit=10');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data.services).toHaveLength(2);
            expect(data.data.pagination.total).toBe(2);
        });

        it('should filter by category', async () => {
            (prisma.service.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.service.count as jest.Mock).mockResolvedValue(0);

            const request = new NextRequest('http://localhost:3000/api/services?categoryId=cat-123');
            await GET(request);

            expect(prisma.service.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        categoryId: 'cat-123',
                    }),
                })
            );
        });
    });

    describe('POST', () => {
        it('should create a new service successfully', async () => {
            // Mock user (FREELANCER)
            (getCurrentUser as jest.Mock).mockResolvedValue({
                id: 'user-123',
                role: UserRole.FREELANCER,
            });

            // Mock category exists
            (prisma.category.findUnique as jest.Mock).mockResolvedValue({
                id: '550e8400-e29b-41d4-a716-446655440000'
            });

            // Mock service count
            (prisma.service.count as jest.Mock).mockResolvedValue(5);

            // Mock prisma create
            const mockService = {
                id: 'service-123',
                name: 'New Service',
                providerId: 'user-123',
                description: 'Test description',
                price: 1500,
                duration: 60,
                categoryId: '550e8400-e29b-41d4-a716-446655440000',
            };
            (prisma.service.create as jest.Mock).mockResolvedValue(mockService);

            const request = new NextRequest('http://localhost:3000/api/services', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New Service',
                    description: 'This is a long enough description for the service.',
                    price: 1500,
                    duration: 60,
                    categoryId: '550e8400-e29b-41d4-a716-446655440000',
                }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data.name).toBe('New Service');
        });

        it('should reject unauthorized request', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/services', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Service',
                    description: 'Description',
                }),
            });

            const response = await POST(request);
            expect(response.status).toBe(401);
        });

        it('should reject non-provider roles', async () => {
            (getCurrentUser as jest.Mock).mockResolvedValue({
                id: 'user-123',
                role: UserRole.CLIENT,
            });

            const request = new NextRequest('http://localhost:3000/api/services', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Service',
                    description: 'Description',
                }),
            });

            const response = await POST(request);
            expect(response.status).toBe(403);
        });
    });
});