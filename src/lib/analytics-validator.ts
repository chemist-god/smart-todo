import { safeAccess, safeArray, safeNumber, safeString } from './error-handler';

// Analytics data validation and normalization

export interface ProductivityData {
    dailyStats: Array<{
        date: string;
        completed: number;
        created: number;
        points: number;
    }>;
    weeklyStats: Array<{
        week: string;
        completed: number;
        created: number;
        completionRate: number;
    }>;
    priorityBreakdown: Array<{
        priority: string;
        count: number;
    }>;
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
    avgCompletionTime: number;
    productivityScore: number;
    overallCompletionRate: number;
    totalPointsEarned: number;
    totalCompleted: number;
    totalCreated: number;
}

export interface PatternData {
    peakHours: Array<{
        hour: number;
        time: string;
        completed: number;
        points: number;
    }>;
    dayPatterns: Array<{
        day: number;
        dayName: string;
        completed: number;
        created: number;
    }>;
    priorityPatterns: Array<{
        priority: string;
        count: number;
        avgPoints: number;
        completionRate: number;
    }>;
    completionTimeRanges: Array<{
        range: string;
        count: number;
    }>;
    mostProductiveDay: {
        day: number;
        dayName: string;
        completed: number;
        points: number;
    };
    insights: Array<{
        type: string;
        message: string;
        priority: string;
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
        weeklyStats: safeArray(data?.weeklyStats, []).map((item: any) => ({
            week: safeString(item?.week, 'Week 1'),
            completed: safeNumber(item?.completed, 0),
            created: safeNumber(item?.created, 0),
            completionRate: safeNumber(item?.completionRate, 0)
        })),
        priorityBreakdown: safeArray(data?.priorityBreakdown, []).map((item: any) => ({
            priority: safeString(item?.priority, 'Unknown'),
            count: safeNumber(item?.count, 0)
        })),
        completionRate: safeNumber(data?.completionRate, 0),
        totalTasks: safeNumber(data?.totalTasks, 0),
        completedTasks: safeNumber(data?.completedTasks, 0),
        avgCompletionTime: safeNumber(data?.avgCompletionTime, 0),
        productivityScore: safeNumber(data?.productivityScore, 0),
        overallCompletionRate: safeNumber(data?.overallCompletionRate, 0),
        totalPointsEarned: safeNumber(data?.totalPointsEarned, 0),
        totalCompleted: safeNumber(data?.totalCompleted, 0),
        totalCreated: safeNumber(data?.totalCreated, 0)
    };
}

// Validate and normalize pattern data
export function validatePatternData(data: any): PatternData {
    return {
        peakHours: safeArray(data?.peakHours, []).map((item: any) => ({
            hour: safeNumber(item?.hour, 0),
            time: safeString(item?.time, `${item?.hour?.toString().padStart(2, '0') || '00'}:00`),
            completed: safeNumber(item?.completed, 0),
            points: safeNumber(item?.points, 0)
        })),
        dayPatterns: safeArray(data?.dayPatterns, []).map((item: any) => ({
            day: safeNumber(item?.day, 0),
            dayName: safeString(item?.dayName, 'Unknown'),
            completed: safeNumber(item?.completed, 0),
            created: safeNumber(item?.created, 0)
        })),
        priorityPatterns: safeArray(data?.priorityPatterns, []).map((item: any) => ({
            priority: safeString(item?.priority, 'Unknown'),
            count: safeNumber(item?.count, 0),
            avgPoints: safeNumber(item?.avgPoints, 0),
            completionRate: safeNumber(item?.completionRate, 0)
        })),
        completionTimeRanges: safeArray(data?.completionTimeRanges, []).map((item: any) => ({
            range: safeString(item?.range, 'Unknown'),
            count: safeNumber(item?.count, 0)
        })),
        mostProductiveDay: data?.mostProductiveDay && typeof data.mostProductiveDay === 'object' ? {
            day: safeNumber(data.mostProductiveDay.day, 1),
            dayName: safeString(data.mostProductiveDay.dayName, 'Monday'),
            completed: safeNumber(data.mostProductiveDay.completed, 0),
            points: safeNumber(data.mostProductiveDay.points, 0)
        } : {
            day: 1,
            dayName: 'Monday',
            completed: 0,
            points: 0
        },
        insights: safeArray(data?.insights, []).map((item: any) => ({
            type: safeString(item?.type, 'info'),
            message: safeString(item?.message, ''),
            priority: safeString(item?.priority, 'medium')
        })),
        productivityScore: safeNumber(data?.productivityScore, 0),
        totalCompleted: safeNumber(data?.totalCompleted, 0),
        totalCreated: safeNumber(data?.totalCreated, 0),
        completionRate: safeNumber(data?.completionRate, 0)
    };
}

// Safe data access utilities
