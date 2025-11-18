import { SWRConfiguration } from 'swr';

// Global SWR configuration for better caching and real-time updates
export const swrConfig: SWRConfiguration = {
    // Cache data for 5 minutes by default
    dedupingInterval: 300000, // 5 minutes

    // Revalidate on focus (when user switches back to tab)
    revalidateOnFocus: true,

    // Revalidate when network reconnects
    revalidateOnReconnect: true,

    // Don't revalidate on mount if data is fresh
    revalidateIfStale: true,

    // Error retry configuration
    errorRetryCount: 3,
    errorRetryInterval: 5000, // 5 seconds

    // Background refresh interval (30 seconds)
    refreshInterval: 30000,

    // Don't refresh when tab is not visible
    refreshWhenHidden: false,

    // Don't refresh when offline
    refreshWhenOffline: false,

    // Global error handler
    onError: (error, key) => {
        console.error('SWR Error:', { error, key });
        // You could integrate with a toast notification system here
    },

    // Global success handler
    onSuccess: (data, key) => {
        console.log('SWR Success:', { key, dataLength: Array.isArray(data) ? data.length : 'not array' });
    },

    // Global loading handler
    onLoadingSlow: (key) => {
        console.log('SWR Slow Loading:', key);
    },
};

// Specific configurations for different data types
export const swrConfigs = {
    // For frequently changing data (todos, goals)
    dynamic: {
        ...swrConfig,
        dedupingInterval: 5000, // 5 seconds (reduced from 60)
        refreshInterval: 30000, // 30 seconds (increased from 15)
    },

    // For relatively static data (user stats, achievements)
    static: {
        ...swrConfig,
        dedupingInterval: 600000, // 10 minutes
        refreshInterval: 300000, // 5 minutes
    },

    // For analytics data (expensive to compute)
    analytics: {
        ...swrConfig,
        dedupingInterval: 300000, // 5 minutes
        refreshInterval: 600000, // 10 minutes
        revalidateOnFocus: false, // Don't refresh analytics on focus
    },

    // For real-time data (live updates)
    realtime: {
        ...swrConfig,
        dedupingInterval: 10000, // 10 seconds
        refreshInterval: 5000, // 5 seconds
        revalidateOnFocus: true,
    }
};

// Helper function to get appropriate config for data type
export function getSWRConfig(dataType: 'dynamic' | 'static' | 'analytics' | 'realtime' = 'dynamic') {
    return swrConfigs[dataType];
}
