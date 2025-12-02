"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    BellIcon,
    CheckCircleIcon,
    XMarkIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    ClockIcon,
    CurrencyDollarIcon,
    TrophyIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckIcon,
    TrashIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import NotificationCard from "@/components/notifications/NotificationCard";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import EmptyState from "@/components/notifications/EmptyState";

interface Notification {
    id: string;
    type: 'stake' | 'todo' | 'achievement' | 'system' | 'reminder';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    metadata?: Record<string, any>;
}

type FilterType = 'all' | 'unread' | 'stake' | 'todo' | 'achievement' | 'system' | 'reminder';
type SortType = 'newest' | 'oldest' | 'priority';

export default function NotificationsPage() {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<FilterType>('all');
    const [sort, setSort] = useState<SortType>('newest');
    const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

    // Fetch notifications
    const { data: notificationsData, error, mutate, isLoading } = useSWR<{ notifications: Notification[] }>(
        session?.user ? "/api/notifications" : null,
        fetcher,
        { refreshInterval: 30000 }
    );

    const notifications = notificationsData?.notifications || [];

    // Filter and sort notifications
    const filteredNotifications = useMemo(() => {
        let filtered = notifications;

        // Apply filter
        if (filter !== 'all') {
            if (filter === 'unread') {
                filtered = filtered.filter(n => !n.read);
            } else {
                filtered = filtered.filter(n => n.type === filter);
            }
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.message.toLowerCase().includes(query)
            );
        }

        // Apply sort
        filtered = [...filtered].sort((a, b) => {
            if (sort === 'newest') {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            } else if (sort === 'oldest') {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            } else {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']);
            }
        });

        return filtered;
    }, [notifications, filter, searchQuery, sort]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Mark as read
    const markAsRead = async (notificationIds: string[]) => {
        try {
            await Promise.all(
                notificationIds.map(id =>
                    fetch(`/api/notifications/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ read: true })
                    })
                )
            );
            mutate();
            setSelectedNotifications(new Set());
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length > 0) {
            await markAsRead(unreadIds);
        }
    };

    // Delete notifications
    const deleteNotifications = async (notificationIds: string[]) => {
        try {
            await Promise.all(
                notificationIds.map(id =>
                    fetch(`/api/notifications/${id}`, {
                        method: 'DELETE'
                    })
                )
            );
            mutate();
            setSelectedNotifications(new Set());
        } catch (error) {
            console.error('Error deleting notifications:', error);
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedNotifications);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedNotifications(newSelected);
    };

    const selectAll = () => {
        if (selectedNotifications.size === filteredNotifications.length) {
            setSelectedNotifications(new Set());
        } else {
            setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                                    <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                        Notifications
                                    </h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    onClick={markAllAsRead}
                                    variant="outline"
                                    size="sm"
                                    className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 text-xs sm:text-sm"
                                >
                                    <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                    Mark all read
                                </Button>
                            )}
                            <Button
                                onClick={() => mutate()}
                                variant="outline"
                                size="sm"
                                className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 text-xs sm:text-sm"
                            >
                                <ArrowPathIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search notifications..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 sm:pl-12 h-10 sm:h-11 bg-muted/30 border-border/50 focus:bg-background"
                                />
                            </div>

                            {/* Filters and Sort */}
                            <NotificationFilters
                                filter={filter}
                                sort={sort}
                                onFilterChange={setFilter}
                                onSortChange={setSort}
                            />
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedNotifications.size > 0 && (
                        <div className="bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
                            <p className="text-sm font-medium text-foreground">
                                {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => markAsRead(Array.from(selectedNotifications))}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs sm:text-sm"
                                >
                                    <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                    Mark read
                                </Button>
                                <Button
                                    onClick={() => deleteNotifications(Array.from(selectedNotifications))}
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive text-xs sm:text-sm"
                                >
                                    <TrashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                    Delete
                                </Button>
                                <Button
                                    onClick={() => setSelectedNotifications(new Set())}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs sm:text-sm"
                                >
                                    <XMarkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="space-y-3 sm:space-y-4">
                        {isLoading ? (
                            <div className="space-y-3 sm:space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 sm:h-28 bg-muted/30 rounded-xl sm:rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl sm:rounded-2xl p-6 text-center">
                                <ExclamationTriangleIcon className="h-8 w-8 text-destructive mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load notifications</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {error instanceof Error ? error.message : "An error occurred"}
                                </p>
                                <Button onClick={() => mutate()} variant="outline" size="sm">
                                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                                    Retry
                                </Button>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <EmptyState
                                searchQuery={searchQuery}
                                filter={filter}
                                onClearFilters={() => {
                                    setSearchQuery("");
                                    setFilter('all');
                                }}
                            />
                        ) : (
                            <>
                                {filteredNotifications.length > 1 && (
                                    <div className="flex items-center justify-between px-2">
                                        <Button
                                            onClick={selectAll}
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs sm:text-sm text-muted-foreground"
                                        >
                                            {selectedNotifications.size === filteredNotifications.length ? 'Deselect all' : 'Select all'}
                                        </Button>
                                        <p className="text-xs sm:text-sm text-muted-foreground">
                                            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}
                                {filteredNotifications.map((notification) => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        isSelected={selectedNotifications.has(notification.id)}
                                        onSelect={() => toggleSelection(notification.id)}
                                        onMarkAsRead={() => markAsRead([notification.id])}
                                        onDelete={() => deleteNotifications([notification.id])}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

