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
                return <ClockIcon className="h-4 w-4 text-destructive" />;
            case 'achievement':
                return <CheckCircleIcon className="h-4 w-4 text-success" />;
            case 'reminder':
                return <BellIcon className="h-4 w-4 text-info" />;
            case 'reward':
                return <CurrencyDollarIcon className="h-4 w-4 text-warning" />;
            case 'penalty':
                return <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />;
            case 'social':
                return <BellIcon className="h-4 w-4 text-primary" />;
            default:
                return <BellIcon className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getNotificationBgColor = (type: string) => {
        switch (type) {
            case 'deadline':
                return 'bg-destructive/5 border-destructive/20';
            case 'achievement':
                return 'bg-success/5 border-success/20';
            case 'reminder':
                return 'bg-info/5 border-info/20';
            case 'reward':
                return 'bg-warning/5 border-warning/20';
            case 'penalty':
                return 'bg-destructive/5 border-destructive/20';
            case 'social':
                return 'bg-primary/5 border-primary/20';
            default:
                return 'bg-muted/20 border-border/30';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

    if (loading) {
        return (
            <div className="space-y-3">
                {/* Loading Header */}
                <div className="flex items-center gap-2 px-1">
                    <div className="w-6 h-6 bg-muted/30 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-muted/30 rounded w-20 animate-pulse"></div>
                </div>
                
                {/* Loading Cards */}
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-card/40 backdrop-blur-xl border border-white/20 rounded-2xl p-3">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-muted/30 rounded-full animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-muted/30 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-2 bg-muted/20 rounded w-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Compact iPhone-style Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <BellIcon className="w-3 h-3 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                        <div className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                            <span className="text-destructive-foreground text-xs font-bold">{unreadCount}</span>
                        </div>
                    )}
                </div>
                {notifications.length > 3 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs text-primary font-medium"
                    >
                        {showAll ? 'Less' : 'All'}
                    </button>
                )}
            </div>

            {/* iPhone-style Glass Morphism Cards */}
            <div className="space-y-2">
                {notifications.length === 0 ? (
                    <div className="bg-card/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <BellIcon className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-foreground mb-1">No notifications</p>
                        <p className="text-xs text-muted-foreground/70">Updates will appear here</p>
                    </div>
                ) : (
                    displayedNotifications.slice(0, showAll ? notifications.length : 3).map((notification) => (
                        <div
                            key={notification.id}
                            className={`group relative bg-card/40 backdrop-blur-xl border border-white/20 rounded-2xl p-3 transition-all duration-300 cursor-pointer hover:bg-card/60 hover:scale-[1.02] active:scale-[0.98] ${!notification.read ? 'shadow-lg shadow-' + notification.type.toLowerCase() + '/10' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            {/* Glass morphism overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
                            
                            <div className="relative flex items-start gap-3">
                                {/* Icon with glass effect */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 ${!notification.read ? getNotificationBgColor(notification.type).replace('bg-', 'bg-').replace('/5', '/20') : 'bg-muted/20'}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    {/* Header with timestamp */}
                                    <div className="flex items-start justify-between mb-1">
                                        <h4 className={`text-sm font-semibold leading-tight ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-muted-foreground/70 ml-2 flex-shrink-0">
                                            {new Date(notification.timestamp).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    
                                    {/* Message */}
                                    <p className="text-xs leading-relaxed text-muted-foreground/90 mb-1">
                                        {notification.message}
                                    </p>
                                    
                                    {/* Amount if present */}
                                    {notification.amount && (
                                        <p className="text-xs font-bold text-success tabular-nums">
                                            ₵{notification.amount.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Unread indicator */}
                                {!notification.read && (
                                    <div className="flex-shrink-0">
                                        <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
