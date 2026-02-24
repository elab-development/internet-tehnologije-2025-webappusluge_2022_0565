import { GET } from '@/app/api/health/route';

// Mock Prisma
jest.mock('@/lib/db/prisma', () => ({
    prisma: {
        $queryRaw: jest.fn(),
    },
}));

import { prisma } from '@/lib/db/prisma';

describe('GET /api/health', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return healthy status when database is connected', async () => {
        // Mock successful database query
        (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ result: 1 }]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('healthy');
        expect(data.database).toBe('connected');
        expect(data).toHaveProperty('timestamp');
        expect(data).toHaveProperty('uptime');
    });

    it('should return unhealthy status when database is disconnected', async () => {
        // Mock database error
        (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection failed'));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('unhealthy');
        expect(data.database).toBe('disconnected');
        expect(data).toHaveProperty('error');
    });
});
