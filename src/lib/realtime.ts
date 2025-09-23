import { mutate } from 'swr';

// Real-time data synchronization system
class RealtimeSync {
    private refreshInterval: NodeJS.Timeout | null = null;
    private isActive = false;

    // Start real-time synchronization
    start() {
        if (this.isActive) return;

        this.isActive = true;
        console.log('🔄 Starting real-time data sync...');

        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.refreshAllData();
        }, 30000);
    }

    // Stop real-time synchronization
    stop() {
        if (!this.isActive) return;

        this.isActive = false;
        console.log('⏹️ Stopping real-time data sync...');

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // Refresh all cached data
    private refreshAllData() {
        console.log('🔄 Refreshing all data...');

        // Refresh user stats
        mutate('/api/stats');

        // Refresh todos
        mutate((key) => typeof key === 'string' && key.startsWith('/api/todos'));

        // Refresh goals
        mutate((key) => typeof key === 'string' && key.startsWith('/api/goals'));

        // Refresh notes
        mutate('/api/notes');

        // Refresh analytics (less frequently)
        mutate((key) => typeof key === 'string' && key.startsWith('/api/analytics'));
    }

    // Refresh specific data type
    refreshData(type: 'stats' | 'todos' | 'goals' | 'notes' | 'analytics') {
        console.log(`🔄 Refreshing ${type} data...`);

        switch (type) {
            case 'stats':
                mutate('/api/stats');
                break;
            case 'todos':
                mutate((key) => typeof key === 'string' && key.startsWith('/api/todos'));
                break;
            case 'goals':
                mutate((key) => typeof key === 'string' && key.startsWith('/api/goals'));
                break;
            case 'notes':
                mutate('/api/notes');
                break;
            case 'analytics':
                mutate((key) => typeof key === 'string' && key.startsWith('/api/analytics'));
                break;
        }
    }

    // Get sync status
    getStatus() {
        return {
            isActive: this.isActive,
            hasInterval: this.refreshInterval !== null,
        };
    }
}

// Create singleton instance
export const realtimeSync = new RealtimeSync();

// Auto-start when module loads (in browser)
if (typeof window !== 'undefined') {
    realtimeSync.start();
}

// Auto-stop when page unloads
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        realtimeSync.stop();
    });
}

// Export for manual control
export { RealtimeSync };
