"use client";

import { cn } from '@/lib/utils';
import { useId } from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    text?: string;
}

const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
};

export default function LoadingSpinner({
    size = 'md',
    className,
    text
}: LoadingSpinnerProps) {
    const gradientId = useId();
    const shadowId = `${gradientId}-shadow`;
    const innerGlowId = `${gradientId}-inner-glow`;
    const outerGlowId = `${gradientId}-outer-glow`;
    const ambientShadowId = `${gradientId}-ambient`;

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    {/* Floating animation container */}
                    <div className="relative animate-float">
                        {/* Main 3D spinner */}
                        <div
                            className={cn(
                                'relative flex items-center justify-center transform-gpu',
                                'motion-safe:animate-[spin_2s_cubic-bezier(0.4,0.0,0.2,1)_infinite]',
                                'transition-all duration-700',
                                sizeClasses[size]
                            )}
                        >
                            <svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 400 400"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                            >
                                <defs>
                                    {/* Main gradient for the ring - Aurora primary colors */}
                                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="oklch(0.7 0.15 260)" />
                                        <stop offset="50%" stopColor="oklch(0.6 0.15 140)" />
                                        <stop offset="100%" stopColor="oklch(0.65 0.15 220)" />
                                    </linearGradient>

                                    {/* Inner glow gradient */}
                                    <radialGradient id={innerGlowId} cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                                        <stop offset="0%" stopColor="var(--background)" stopOpacity="0.9" />
                                        <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
                                    </radialGradient>

                                    {/* Outer glow gradient */}
                                    <radialGradient id={outerGlowId} cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                    </radialGradient>

                                    {/* Drop shadow filter */}
                                    <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
                                        <feOffset in="blur" dx="0" dy="10" result="offsetBlur" />
                                        <feComposite in2="SourceAlpha" in="offsetBlur" operator="out" result="shadow" />
                                        <feComponentTransfer in="shadow" result="softShadow">
                                            <feFuncA type="linear" slope="0.2" />
                                        </feComponentTransfer>
                                        <feMerge>
                                            <feMergeNode in="softShadow" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>

                                    {/* Ambient shadow filter */}
                                    <filter id={ambientShadowId} x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur in="SourceAlpha" stdDeviation="20" result="blur" />
                                        <feOffset in="blur" dx="0" dy="20" result="offsetBlur" />
                                        <feComponentTransfer in="offsetBlur" result="softGlow">
                                            <feFuncA type="linear" slope="0.1" />
                                        </feComponentTransfer>
                                    </filter>
                                </defs>

                                {/* Outer glow effect with Aurora theme colors */}
                                <circle
                                    cx="200"
                                    cy="200"
                                    r="150"
                                    fill={`url(#${outerGlowId})`}
                                    filter={`url(#${ambientShadowId})`}
                                    opacity="0.5"
                                    className="dark:opacity-40"
                                />

                                {/* Main ring with 3D effect */}
                                <g filter={`url(#${shadowId})`}>
                                    <circle
                                        cx="200"
                                        cy="200"
                                        r="120"
                                        fill="none"
                                        stroke={`url(#${gradientId})`}
                                        strokeWidth="16"
                                        strokeLinecap="round"
                                        strokeDasharray="10, 30"
                                        strokeDashoffset="0"
                                        className="animate-dash"
                                    />
                                    
                                    {/* Inner glow */}
                                    <circle
                                        cx="200"
                                        cy="200"
                                        r="120"
                                        fill={`url(#${innerGlowId})`}
                                        opacity="0.3"
                                    />

                                    {/* 3D highlight */}
                                    <circle
                                        cx="200"
                                        cy="200"
                                        r="128"
                                        fill="none"
                                        stroke="var(--primary-foreground)"
                                        strokeWidth="1"
                                        strokeOpacity="0.3"
                                        className="dark:stroke-background"
                                    />
                                </g>

                                {/* Floating particles */}
                                {[...Array(8)].map((_, i) => (
                                    <circle
                                        key={i}
                                        cx={200 + Math.cos((i * 45 * Math.PI) / 180) * 90}
                                        cy={200 + Math.sin((i * 45 * Math.PI) / 180) * 90}
                                        r="4"
                                        fill="var(--primary)"
                                        className="opacity-0 animate-pulse dark:fill-primary-foreground"
                                        style={{
                                            animationDelay: `${i * 0.1}s`,
                                            animationDuration: '2s',
                                            animationIterationCount: 'infinite',
                                            animationTimingFunction: 'ease-in-out',
                                        }}
                                    />
                                ))}
                            </svg>
                        </div>
                        
                        {/* Ground shadow with Aurora theme colors */}
                        <div className="absolute -bottom-2 left-1/2 w-3/4 h-3 bg-primary/10 dark:bg-primary-foreground/10 blur-md rounded-full -translate-x-1/2 scale-90" />
                    </div>
                </div>
                
                {text && (
                    <span className="text-sm font-medium text-muted-foreground animate-pulse">
                        {text}
                    </span>
                )}
            </div>
            
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { 
                        transform: translateY(0) rotate(0deg); 
                    }
                    50% { 
                        transform: translateY(-8px) rotate(2deg);
                        filter: drop-shadow(0 10px 8px var(--primary)/0.1);
                    }
                }
                @keyframes dash {
                    0% { 
                        stroke-dashoffset: 0;
                        opacity: 0.8;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% { 
                        stroke-dashoffset: 80;
                        opacity: 0.8;
                    }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-dash {
                    animation: dash 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
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
                        'bg-muted rounded',
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
        <div className={cn('bg-card rounded-xl border border-border shadow-soft p-6', className)}>
            <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="rounded-full bg-muted h-10 w-10"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
            </div>
        </div>
    );
}
