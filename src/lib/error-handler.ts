// Enhanced error handling utilities

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

// Error handler for API routes
export function handleApiError(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof AppError) {
        return {
            error: error.message,
            statusCode: error.statusCode,
            isOperational: error.isOperational
        };
    }

    if (error instanceof Error) {
        return {
            error: error.message,
            statusCode: 500,
            isOperational: false
        };
    }

    return {
        error: 'An unexpected error occurred',
        statusCode: 500,
        isOperational: false
    };
}

// Safe data access with fallbacks
export function safeAccess<T>(
    data: any,
    path: string,
    fallback: T
): T {
    try {
        const keys = path.split('.');
        let result = data;

        for (const key of keys) {
            if (result === null || result === undefined) {
                return fallback;
            }
            result = result[key];
        }

        return result !== undefined ? result : fallback;
    } catch {
        return fallback;
    }
}

// Type guard for checking if data has required properties
export function hasRequiredProperties<T extends Record<string, any>>(
    data: any,
    requiredKeys: (keyof T)[]
): data is T {
    if (!data || typeof data !== 'object') {
        return false;
    }

    return requiredKeys.every(key => key in data);
}

// Safe array access
export function safeArray<T>(data: any, fallback: T[] = []): T[] {
    return Array.isArray(data) ? data : fallback;
}

// Safe number access
export function safeNumber(data: any, fallback: number = 0): number {
    const num = Number(data);
    return isNaN(num) ? fallback : num;
}

// Safe string access
export function safeString(data: any, fallback: string = ''): string {
    return typeof data === 'string' ? data : fallback;
}
