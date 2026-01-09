import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * Sprečava kreiranje više instanci u development modu
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper funkcija za disconnect (koristi se u serverless okruženjima)
 */
export async function disconnectDB() {
  await prisma.$disconnect();
}