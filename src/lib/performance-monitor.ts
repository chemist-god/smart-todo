// Performance monitoring utilities
export class PerformanceMonitor {
    private static metrics: Map<string, number[]> = new Map();

    static startTimer(label: string): () => void {
        const start = performance.now();

        return () => {
            const duration = performance.now() - start;
            this.recordMetric(label, duration);
        };
    }

    static recordMetric(label: string, value: number): void {
        if (!this.metrics.has(label)) {
            this.metrics.set(label, []);
        }

        const values = this.metrics.get(label)!;
        values.push(value);

        // Keep only last 100 measurements
        if (values.length > 100) {
            values.shift();
        }
    }

    static getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
        const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};

        for (const [label, values] of this.metrics.entries()) {
            if (values.length === 0) continue;

            const sum = values.reduce((a, b) => a + b, 0);
            result[label] = {
                avg: sum / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                count: values.length
            };
        }

        return result;
    }

    static clearMetrics(): void {
        this.metrics.clear();
    }
}

// Database query performance wrapper
export function withPerformanceMonitoring<T>(
    operation: () => Promise<T>,
    label: string
): Promise<T> {
    const endTimer = PerformanceMonitor.startTimer(label);

    return operation().finally(() => {
        endTimer();
    });
}

