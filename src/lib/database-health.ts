// Database health check and connection management
import { prisma } from './prisma';

export interface DatabaseHealth {
    isConnected: boolean;
    latency: number;
    error?: string;
    lastChecked: Date;
}

export class DatabaseHealthService {
    private static lastCheck: Date | null = null;
    private static healthCache: DatabaseHealth | null = null;
    private static readonly CACHE_DURATION = 30000; // 30 seconds

    static async checkHealth(): Promise<DatabaseHealth> {
        const now = new Date();

        // Return cached result if still valid
        if (this.healthCache && this.lastCheck &&
            (now.getTime() - this.lastCheck.getTime()) < this.CACHE_DURATION) {
            return this.healthCache;
        }

        const startTime = Date.now();

        try {
            // Simple query to test connection
            await prisma.$queryRaw`SELECT 1`;

            const latency = Date.now() - startTime;

            this.healthCache = {
                isConnected: true,
                latency,
                lastChecked: now
            };

            this.lastCheck = now;
            return this.healthCache;

        } catch (error) {
            const latency = Date.now() - startTime;

            this.healthCache = {
                isConnected: false,
                latency,
                error: error instanceof Error ? error.message : 'Unknown database error',
                lastChecked: now
            };

            this.lastCheck = now;
            return this.healthCache;
        }
    }

    static async ensureConnection(): Promise<boolean> {
        const health = await this.checkHealth();
        return health.isConnected;
    }

    static getCachedHealth(): DatabaseHealth | null {
        return this.healthCache;
    }
}

