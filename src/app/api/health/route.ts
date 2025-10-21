import { NextRequest, NextResponse } from 'next/server';
import { DatabaseHealthService } from '@/lib/database-health';

export async function GET(request: NextRequest) {
    try {
        const dbHealth = await DatabaseHealthService.checkHealth();

        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: {
                connected: dbHealth.isConnected,
                latency: dbHealth.latency,
                error: dbHealth.error
            },
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            }
        };

        const statusCode = dbHealth.isConnected ? 200 : 503;

        return NextResponse.json(health, { status: statusCode });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

