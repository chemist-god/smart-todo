"use client";

import { useEffect, useState } from 'react';
import { notificationService, NotificationOptions } from '@/lib/notification-service';

export interface UseNotificationsReturn {
    canNotify: boolean;
    permission: NotificationPermission;
    requestPermission: () => Promise<NotificationPermission>;
    showNotification: (options: NotificationOptions) => Promise<Notification | null>;
    showTimerNotification: (type: 'start' | 'pause' | 'stop' | 'complete' | 'break', todoTitle: string) => Promise<Notification | null>;
    showPomodoroNotification: (type: 'focus-start' | 'focus-end' | 'break-start' | 'break-end' | 'long-break-start') => Promise<Notification | null>;
    showReminderNotification: (todoTitle: string, timeUntil: string) => Promise<Notification | null>;
    showOverdueNotification: (todoTitle: string) => Promise<Notification | null>;
    showAchievementNotification: (achievementName: string, description: string) => Promise<Notification | null>;
}

export function useNotifications(): UseNotificationsReturn {
    const [canNotify, setCanNotify] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        setCanNotify(notificationService.canNotify());
        setPermission(notificationService.getPermissionStatus());
    }, []);

    const requestPermission = async (): Promise<NotificationPermission> => {
        const newPermission = await notificationService.requestPermission();
        setPermission(newPermission);
        setCanNotify(notificationService.canNotify());
        return newPermission;
    };

    const showNotification = async (options: NotificationOptions): Promise<Notification | null> => {
        return notificationService.showNotification(options);
    };

    const showTimerNotification = async (type: 'start' | 'pause' | 'stop' | 'complete' | 'break', todoTitle: string): Promise<Notification | null> => {
        return notificationService.showTimerNotification(type, todoTitle);
    };

    const showPomodoroNotification = async (type: 'focus-start' | 'focus-end' | 'break-start' | 'break-end' | 'long-break-start'): Promise<Notification | null> => {
        return notificationService.showPomodoroNotification(type);
    };

    const showReminderNotification = async (todoTitle: string, timeUntil: string): Promise<Notification | null> => {
        return notificationService.showReminderNotification(todoTitle, timeUntil);
    };

    const showOverdueNotification = async (todoTitle: string): Promise<Notification | null> => {
        return notificationService.showOverdueNotification(todoTitle);
    };

    const showAchievementNotification = async (achievementName: string, description: string): Promise<Notification | null> => {
        return notificationService.showAchievementNotification(achievementName, description);
    };

    return {
        canNotify,
        permission,
        requestPermission,
        showNotification,
        showTimerNotification,
        showPomodoroNotification,
        showReminderNotification,
        showOverdueNotification,
        showAchievementNotification,
    };
}
