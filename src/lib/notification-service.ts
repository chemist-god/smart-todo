"use client";

export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    silent?: boolean;
    vibrate?: number[];
    actions?: NotificationAction[];
}

export interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
}

class NotificationService {
    private permission: NotificationPermission = 'default';
    private isSupported: boolean;

    constructor() {
        this.isSupported = 'Notification' in window;
        this.requestPermission();
    }

    async requestPermission(): Promise<NotificationPermission> {
        if (!this.isSupported) {
            console.warn('Notifications are not supported in this browser');
            return 'denied';
        }

        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }

        return this.permission;
    }

    async showNotification(options: NotificationOptions): Promise<Notification | null> {
        if (!this.isSupported) {
            console.warn('Notifications are not supported in this browser');
            return null;
        }

        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        try {
            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon || '/favicon.ico',
                badge: options.badge || '/favicon.ico',
                tag: options.tag,
                requireInteraction: options.requireInteraction || false,
                silent: options.silent || false,
                vibrate: options.vibrate,
                actions: options.actions,
            });

            // Auto-close after 5 seconds unless requireInteraction is true
            if (!options.requireInteraction) {
                setTimeout(() => {
                    notification.close();
                }, 5000);
            }

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
            return null;
        }
    }

    async showTimerNotification(type: 'start' | 'pause' | 'stop' | 'complete' | 'break', todoTitle: string): Promise<Notification | null> {
        const notifications = {
            start: {
                title: 'Timer Started',
                body: `Focus time for "${todoTitle}" has begun!`,
                tag: 'timer-start',
                requireInteraction: false,
            },
            pause: {
                title: 'Timer Paused',
                body: `Timer for "${todoTitle}" has been paused`,
                tag: 'timer-pause',
                requireInteraction: false,
            },
            stop: {
                title: 'Timer Stopped',
                body: `Timer for "${todoTitle}" has been stopped`,
                tag: 'timer-stop',
                requireInteraction: false,
            },
            complete: {
                title: 'Session Complete! 🎉',
                body: `Great job completing "${todoTitle}"!`,
                tag: 'timer-complete',
                requireInteraction: true,
                vibrate: [200, 100, 200],
            },
            break: {
                title: 'Break Time! ☕',
                body: `Time for a break after "${todoTitle}"`,
                tag: 'timer-break',
                requireInteraction: false,
            },
        };

        return this.showNotification(notifications[type]);
    }

    async showPomodoroNotification(type: 'focus-start' | 'focus-end' | 'break-start' | 'break-end' | 'long-break-start'): Promise<Notification | null> {
        const notifications = {
            'focus-start': {
                title: '🍅 Focus Time!',
                body: 'Time to focus and get things done!',
                tag: 'pomodoro-focus-start',
                requireInteraction: false,
            },
            'focus-end': {
                title: 'Focus Session Complete!',
                body: 'Great work! Time for a short break.',
                tag: 'pomodoro-focus-end',
                requireInteraction: true,
                vibrate: [200, 100, 200],
            },
            'break-start': {
                title: '☕ Break Time!',
                body: 'Take a 5-minute break to recharge.',
                tag: 'pomodoro-break-start',
                requireInteraction: false,
            },
            'break-end': {
                title: 'Break Over!',
                body: 'Ready to get back to work?',
                tag: 'pomodoro-break-end',
                requireInteraction: false,
            },
            'long-break-start': {
                title: '🌴 Long Break!',
                body: 'Take a 15-minute break to fully recharge.',
                tag: 'pomodoro-long-break-start',
                requireInteraction: false,
            },
        };

        return this.showNotification(notifications[type]);
    }

    async showReminderNotification(todoTitle: string, timeUntil: string): Promise<Notification | null> {
        return this.showNotification({
            title: 'Todo Reminder',
            body: `"${todoTitle}" is due ${timeUntil}`,
            tag: 'todo-reminder',
            requireInteraction: true,
            vibrate: [100, 50, 100],
        });
    }

    async showOverdueNotification(todoTitle: string): Promise<Notification | null> {
        return this.showNotification({
            title: '⚠️ Overdue Todo',
            body: `"${todoTitle}" is overdue!`,
            tag: 'todo-overdue',
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200],
        });
    }

    async showAchievementNotification(achievementName: string, description: string): Promise<Notification | null> {
        return this.showNotification({
            title: `🏆 Achievement Unlocked: ${achievementName}`,
            body: description,
            tag: 'achievement',
            requireInteraction: true,
            vibrate: [300, 100, 300],
        });
    }

    // Utility method to check if notifications are supported and permitted
    canNotify(): boolean {
        return this.isSupported && this.permission === 'granted';
    }

    // Get current permission status
    getPermissionStatus(): NotificationPermission {
        return this.permission;
    }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export the class for testing
export { NotificationService };
