"use client";

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
};

export default function LoadingSpinner({
    size = 'md',
    className,
    text
}: LoadingSpinnerProps) {
    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div className="flex flex-col items-center gap-2">
                <div
                    className={cn(
                        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
                        sizeClasses[size]
                    )}
                />
                {text && (
                    <p className="text-sm text-gray-600 animate-pulse">{text}</p>
                )}
            </div>
        </div>
    );
}

export function LoadingSkeleton({
    className,
    lines = 3
}: {
    className?: string;
    lines?: number;
}) {
    return (
        <div className={cn('animate-pulse', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'bg-gray-200 rounded',
                        i === lines - 1 ? 'w-3/4' : 'w-full',
                        'h-4 mb-2'
                    )}
                />
            ))}
        </div>
    );
}

export function LoadingCard({ className }: { className?: string }) {
    return (
        <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-6', className)}>
            <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
            </div>
        </div>
    );
}
