"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CheckCircleIcon,
    CurrencyDollarIcon,
    TrophyIcon,
    InformationCircleIcon,
    ClockIcon,
    CheckIcon,
    TrashIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

interface NotificationCardProps {
    notification: Notification;
    isSelected: boolean;
    onSelect: () => void;
    onMarkAsRead: () => void;
    onDelete: () => void;
}

const typeConfig = {
    stake: {
        icon: CurrencyDollarIcon,
        gradient: "from-warning to-warning/80",
        bgGradient: "from-warning/10 to-warning/5",
        borderColor: "border-warning/20"
    },
    todo: {
        icon: CheckCircleIcon,
        gradient: "from-success to-success/80",
        bgGradient: "from-success/10 to-success/5",
        borderColor: "border-success/20"
    },
    achievement: {
        icon: TrophyIcon,
        gradient: "from-primary to-primary/80",
        bgGradient: "from-primary/10 to-primary/5",
        borderColor: "border-primary/20"
    },
    system: {
        icon: InformationCircleIcon,
        gradient: "from-info to-info/80",
        bgGradient: "from-info/10 to-info/5",
        borderColor: "border-info/20"
    },
    reminder: {
        icon: ClockIcon,
        gradient: "from-primary to-primary/80",
        bgGradient: "from-primary/10 to-primary/5",
        borderColor: "border-primary/20"
    }
};

const priorityConfig = {
    high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/20" },
    medium: { label: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
    low: { label: "Low", className: "bg-muted text-muted-foreground border-border" }
};

export default function NotificationCard({
    notification,
    isSelected,
    onSelect,
    onMarkAsRead,
    onDelete
}: NotificationCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const config = typeConfig[notification.type];
    const Icon = config.icon;
    const priority = priorityConfig[notification.priority || 'low'];

    const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

    const content = (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border transition-all duration-300",
                notification.read
                    ? "border-border/50 opacity-75"
                    : cn("border-primary/20 shadow-md", config.borderColor),
                isSelected && "ring-2 ring-primary ring-offset-2",
                "hover:shadow-lg hover:scale-[1.01]"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                config.bgGradient
            )} />

            <div className="relative p-3 sm:p-4 md:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                    {/* Checkbox */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                        className={cn(
                            "mt-1 flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 transition-all duration-200",
                            isSelected
                                ? "bg-primary border-primary"
                                : "border-border hover:border-primary/50"
                        )}
                    >
                        {isSelected && (
                            <CheckIcon className="w-full h-full text-primary-foreground" />
                        )}
                    </button>

                    {/* Icon */}
                    <div className={cn(
                        "flex-shrink-0 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br shadow-md",
                        config.gradient
                    )}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className={cn(
                                        "text-sm sm:text-base font-semibold truncate",
                                        !notification.read && "text-foreground",
                                        notification.read && "text-muted-foreground"
                                    )}>
                                        {notification.title}
                                    </h3>
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                                    )}
                                    {notification.priority && notification.priority !== 'low' && (
                                        <Badge
                                            variant="outline"
                                            className={cn("text-[10px] sm:text-xs h-4 sm:h-5 px-1.5", priority.className)}
                                        >
                                            {priority.label}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                                    {timeAgo}
                                </span>
                                {(isHovered || isSelected) && (
                                    <div className="flex items-center gap-1">
                                        {!notification.read && (
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onMarkAsRead();
                                                }}
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-success/10"
                                                title="Mark as read"
                                            >
                                                <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                                            </Button>
                                        )}
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete();
                                            }}
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-destructive/10"
                                            title="Delete"
                                        >
                                            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {notification.message}
                        </p>
                        {notification.actionUrl && (
                            <div className="mt-2 sm:mt-3">
                                <Link
                                    href={notification.actionUrl}
                                    className="text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                                >
                                    View details
                                    <span>→</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (notification.actionUrl && !isHovered) {
        return (
            <Link href={notification.actionUrl} className="block">
                {content}
            </Link>
        );
    }

    return content;
}

