import { safeAccess, safeArray, safeNumber, safeString } from './error-handler';

// Analytics data validation and normalization

export interface ProductivityData {
    dailyStats: Array<{
        date: string;
        completed: number;
        created: number;
        points: number;
    }>;
    priorityBreakdown: Array<{
        priority: string;
        count: number;
    }>;
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
    averageCompletionTime: number;
    productivityScore: number;
    overallCompletionRate: number;
}

export interface PatternData {
    peakHours: Array<{
        hour: number;
        productivity: number;
    }>;
    dayPatterns: Array<{
        day: string;
        completed: number;
        created: number;
    }>;
    priorityPatterns: Array<{
        priority: string;
        count: number;
        completionRate: number;
    }>;
    completionTimeRanges: Array<{
        range: string;
        count: number;
    }>;
    mostProductiveDay: string;
    insights: Array<{
        type: string;
        message: string;
    }>;
    productivityScore: number;
    totalCompleted: number;
    totalCreated: number;
    completionRate: number;
}

// Validate and normalize productivity data
export function validateProductivityData(data: any): ProductivityData {
    return {
        dailyStats: safeArray(data?.dailyStats, []).map((item: any) => ({
            date: safeString(item?.date, ''),
            completed: safeNumber(item?.completed, 0),
            created: safeNumber(item?.created, 0),
            points: safeNumber(item?.points, 0)
        })),
        priorityBreakdown: safeArray(data?.priorityBreakdown, []).map((item: any) => ({
            priority: safeString(item?.priority, 'Unknown'),
            count: safeNumber(item?.count, 0)
        })),
        completionRate: safeNumber(data?.completionRate, 0),
        totalTasks: safeNumber(data?.totalTasks, 0),
        completedTasks: safeNumber(data?.completedTasks, 0),
        averageCompletionTime: safeNumber(data?.averageCompletionTime, 0),
        productivityScore: safeNumber(data?.productivityScore, 0),
        overallCompletionRate: safeNumber(data?.overallCompletionRate, 0)
    };
}

// Validate and normalize pattern data
export function validatePatternData(data: any): PatternData {
    return {
        peakHours: safeArray(data?.peakHours, []).map((item: any) => ({
            hour: safeNumber(item?.hour, 0),
            productivity: safeNumber(item?.productivity, 0)
        })),
        dayPatterns: safeArray(data?.dayPatterns, []).map((item: any) => ({
            day: safeString(item?.day, 'Unknown'),
            completed: safeNumber(item?.completed, 0),
            created: safeNumber(item?.created, 0)
        })),
        priorityPatterns: safeArray(data?.priorityPatterns, []).map((item: any) => ({
            priority: safeString(item?.priority, 'Unknown'),
            count: safeNumber(item?.count, 0),
            completionRate: safeNumber(item?.completionRate, 0)
        })),
        completionTimeRanges: safeArray(data?.completionTimeRanges, []).map((item: any) => ({
            range: safeString(item?.range, 'Unknown'),
            count: safeNumber(item?.count, 0)
        })),
        mostProductiveDay: safeString(data?.mostProductiveDay, 'Monday'),
        insights: safeArray(data?.insights, []).map((item: any) => ({
            type: safeString(item?.type, 'info'),
            message: safeString(item?.message, '')
        })),
        productivityScore: safeNumber(data?.productivityScore, 0),
        totalCompleted: safeNumber(data?.totalCompleted, 0),
        totalCreated: safeNumber(data?.totalCreated, 0),
        completionRate: safeNumber(data?.completionRate, 0)
    };
}

// Generate mock data for development/testing
export function generateMockProductivityData(): ProductivityData {
    const days = 30;
    const dailyStats = [];

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        dailyStats.push({
            date: date.toISOString().split('T')[0],
            completed: Math.floor(Math.random() * 10) + 1,
            created: Math.floor(Math.random() * 8) + 1,
            points: Math.floor(Math.random() * 50) + 10
        });
    }

    return {
        dailyStats,
        priorityBreakdown: [
            { priority: 'HIGH', count: 15 },
            { priority: 'MEDIUM', count: 25 },
            { priority: 'LOW', count: 10 }
        ],
        completionRate: 75.5,
        totalTasks: 50,
        completedTasks: 38,
        averageCompletionTime: 2.5,
        productivityScore: 85,
        overallCompletionRate: 76.0
    };
}

export function generateMockPatternData(): PatternData {
    const peakHours = [];
    for (let hour = 0; hour < 24; hour++) {
        peakHours.push({
            hour,
            productivity: Math.random() * 100
        });
    }

    return {
        peakHours,
        dayPatterns: [
            { day: 'Monday', completed: 8, created: 6 },
            { day: 'Tuesday', completed: 12, created: 8 },
            { day: 'Wednesday', completed: 10, created: 7 },
            { day: 'Thursday', completed: 9, created: 9 },
            { day: 'Friday', completed: 7, created: 5 },
            { day: 'Saturday', completed: 4, created: 3 },
            { day: 'Sunday', completed: 3, created: 2 }
        ],
        priorityPatterns: [
            { priority: 'HIGH', count: 15, completionRate: 80 },
            { priority: 'MEDIUM', count: 25, completionRate: 70 },
            { priority: 'LOW', count: 10, completionRate: 60 }
        ],
        completionTimeRanges: [
            { range: '0-1h', count: 20 },
            { range: '1-2h', count: 15 },
            { range: '2-4h', count: 10 },
            { range: '4h+', count: 5 }
        ],
        mostProductiveDay: 'Tuesday',
        insights: [
            { type: 'success', message: 'Great progress this week!' },
            { type: 'tip', message: 'You\'re most productive in the morning' }
        ],
        productivityScore: 85,
        totalCompleted: 53,
        totalCreated: 40,
        completionRate: 76.5
    };
}
