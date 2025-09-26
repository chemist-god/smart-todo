"use client";

import { useState, useEffect } from "react";
import {
    BellIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";

interface Notification {
    id: string;
    type: 'deadline' | 'achievement' | 'reminder' | 'reward' | 'penalty' | 'social';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    stakeId?: string;
    amount?: number;
}

interface StakeNotificationsProps {
    userId: string;
}

export default function StakeNotifications({ userId }: StakeNotificationsProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/notifications/stakes?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true })
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId ? { ...notif, read: true } : notif
                    )
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'deadline':
                return <ClockIcon className="h-5 w-5 text-red-500" />;
            case 'achievement':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'reminder':
                return <BellIcon className="h-5 w-5 text-blue-500" />;
            case 'reward':
                return <CurrencyDollarIcon className="h-5 w-5 text-yellow-500" />;
            case 'penalty':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
            case 'social':
                return <BellIcon className="h-5 w-5 text-purple-500" />;
            default:
                return <BellIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationBgColor = (type: string) => {
        switch (type) {
            case 'deadline':
                return 'bg-red-50 border-red-200';
            case 'achievement':
                return 'bg-green-50 border-green-200';
            case 'reminder':
                return 'bg-blue-50 border-blue-200';
            case 'reward':
                return 'bg-yellow-50 border-yellow-200';
            case 'penalty':
                return 'bg-red-50 border-red-200';
            case 'social':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BellIcon className="h-5 w-5 mr-2" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    {notifications.length > 5 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm text-purple-600 hover:text-purple-700"
                        >
                            {showAll ? 'Show Less' : `Show All (${notifications.length})`}
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                {notifications.length === 0 ? (
                    <div className="text-center py-8">
                        <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                            You'll receive notifications about your stakes here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayedNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg border transition-colors cursor-pointer ${notification.read
                                        ? 'bg-gray-50 border-gray-200'
                                        : getNotificationBgColor(notification.type)
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mr-3">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'
                                                }`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-xs text-gray-500">
                                                {new Date(notification.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'
                                            }`}>
                                            {notification.message}
                                        </p>
                                        {notification.amount && (
                                            <p className="text-sm font-semibold text-green-600 mt-1">
                                                Gh{notification.amount.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                    {!notification.read && (
                                        <div className="flex-shrink-0 ml-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
