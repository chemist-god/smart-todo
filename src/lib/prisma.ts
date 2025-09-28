import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Enhanced Prisma configuration with connection pool management
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Enhanced connection pool configuration
    __internal: {
      engine: {
        connectTimeout: 60000, // 60 seconds
        queryTimeout: 30000,   // 30 seconds
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Connection retry wrapper
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a connection-related error
      if (
        error instanceof Error && 
        (error.message.includes('connection') || 
         error.message.includes('timeout') ||
         error.message.includes('pool') ||
         error.message.includes('P2024') ||
         error.message.includes('P1001'))
      ) {
        console.warn(`Database connection attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          continue;
        }
      }
      
      // If it's not a connection error or we've exhausted retries, throw immediately
      throw error;
    }
  }
  
  throw lastError!;
}

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
