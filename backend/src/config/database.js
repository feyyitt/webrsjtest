/**
 * Prisma Database Client
 * Singleton instance untuk Prisma Client
 */

const { PrismaClient } = require('@prisma/client');

// Inisialisasi Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle disconnect on app termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
