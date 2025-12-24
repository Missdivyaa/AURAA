import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Test database connection on startup
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      console.error('   Host:', url.hostname);
      console.error('   Port:', url.port || '5432 (default)');
    }
  }
}

// Test connection (non-blocking)
testConnection().catch(console.error);

export { prisma };




