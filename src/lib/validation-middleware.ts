import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export function validateRequest<T>(schema: z.ZodSchema<T>) {
    return async (request: NextRequest): Promise<{ data: T; error?: NextResponse }> => {
        try {
            const body = await request.json();
            const data = schema.parse(body);
            return { data };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorResponse = NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message
                        }))
                    },
                    { status: 400 }
                );
                return { data: null as T, error: errorResponse };
            }

            const errorResponse = NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
            return { data: null as T, error: errorResponse };
        }
    };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
    return (request: NextRequest): { data: T; error?: NextResponse } => {
        try {
            const url = new URL(request.url);
            const queryParams = Object.fromEntries(url.searchParams.entries());
            const data = schema.parse(queryParams);
            return { data };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorResponse = NextResponse.json(
                    {
                        error: 'Query validation failed',
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message
                        }))
                    },
                    { status: 400 }
                );
                return { data: null as T, error: errorResponse };
            }

            const errorResponse = NextResponse.json(
                { error: 'Invalid query parameters' },
                { status: 400 }
            );
            return { data: null as T, error: errorResponse };
        }
    };
}

// Common validation schemas
export const commonSchemas = {
    pagination: z.object({
        page: z.string().optional().transform(val => val ? parseInt(val) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
    }),

    idParam: z.object({
        id: z.string().min(1, 'ID is required')
    }),

    stakeId: z.object({
        stakeId: z.string().min(1, 'Stake ID is required')
    })
};

