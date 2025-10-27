"use client";

// no local React state currently needed
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { format } from "date-fns";
import {
    CheckCircleIcon,
    ClockIcon,
    StarIcon,
    FireIcon,
    BookOpenIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";

interface Achievement {
    id: string;
    name: string;
    description: string;
    points: number;
    type: string;
    requirement: number;
    progress: number;
    total: number;
    unlockedAt?: string;
    isUnlocked: boolean;
}

export default function AchievementList() {
    const { data: achievements, error, isLoading, mutate } = useSWR<Achievement[]>("/api/achievements", fetcher, { refreshInterval: 30000 });

    const getAchievementIcon = (name: string) => {
        if (name.includes("Todo")) return CheckCircleIcon;
        if (name.includes("Note")) return DocumentTextIcon;
        if (name.includes("Consistent")) return FireIcon;
        if (name.includes("Bible")) return BookOpenIcon;
        return StarIcon;
    };

    const getProgressPercentage = (achievement: Achievement) => {
        if (!achievement.progress || !achievement.total) return 0;
        return Math.min((achievement.progress / achievement.total) * 100, 100);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Available Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-full mb-3"></div>
                            <div className="h-2 bg-muted rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Available Achievements</h2>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive">Error: {error}</p>
                    <button
                        onClick={() => mutate()}
                        className="mt-2 text-sm text-destructive hover:text-destructive/80 underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Achievements</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">Track your progress and unlock rewards</p>
                </div>
                {achievements && (
                    <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                        <div className="text-center min-w-0">
                            <div className="text-base sm:text-lg font-semibold text-foreground">
                                {achievements.filter(a => a.isUnlocked).length}
                            </div>
                            <div className="text-muted-foreground truncate">Unlocked</div>
                        </div>
                        <div className="text-center min-w-0">
                            <div className="text-base sm:text-lg font-semibold text-foreground">
                                {achievements.filter(a => a.progress && a.progress > 0 && !a.isUnlocked).length}
                            </div>
                            <div className="text-muted-foreground truncate">In Progress</div>
                        </div>
                        <div className="text-center min-w-0">
                            <div className="text-base sm:text-lg font-semibold text-foreground">
                                {achievements.reduce((sum, a) => sum + a.points, 0)}
                            </div>
                            <div className="text-muted-foreground truncate">Total Points</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {achievements?.map((achievement) => {
                    const IconComponent = getAchievementIcon(achievement.name);
                    const progressPercentage = getProgressPercentage(achievement);
                    const isUnlocked = achievement.isUnlocked;
                    const isInProgress = achievement.progress && achievement.progress > 0;

                    return (
                        <div
                            key={achievement.id}
                            className={`group relative bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 cursor-pointer overflow-hidden ${
                                isUnlocked
                                    ? 'border-success/50 bg-gradient-to-br from-success/5 to-success/10'
                                    : isInProgress
                                        ? 'border-info/50 bg-gradient-to-br from-info/5 to-info/10'
                                        : 'hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10'
                            }`}
                        >
                            {/* Achievement Icon */}
                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <div className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group-hover:scale-105 sm:group-hover:scale-110 ${
                                    isUnlocked
                                        ? "bg-success/15 text-success"
                                        : isInProgress
                                            ? "bg-info/15 text-info"
                                            : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
                                }`}>
                                    <IconComponent className="w-4 sm:w-5 h-4 sm:h-5" />
                                    {isUnlocked && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-success rounded-full border-2 border-background flex items-center justify-center">
                                            <CheckCircleIcon className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-success-foreground" />
                                        </div>
                                    )}
                                </div>

                                {/* Points Badge */}
                                <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                                    isUnlocked
                                        ? "bg-success/15 text-success border-success/30"
                                        : "bg-muted/50 text-muted-foreground border-border/50 group-hover:bg-primary/15 group-hover:text-primary group-hover:border-primary/30"
                                }`}>
                                    <StarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    {achievement.points}
                                </span>
                            </div>

                            {/* Achievement Content */}
                            <div className="space-y-2 sm:space-y-3">
                                <div>
                                    <h3 className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                                        isUnlocked
                                            ? "text-success"
                                            : isInProgress
                                                ? "text-info"
                                                : "text-foreground group-hover:text-primary"
                                    }`}>
                                        {achievement.name}
                                    </h3>
                                    <p className={`text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                                        isUnlocked
                                            ? "text-success/80"
                                            : isInProgress
                                                ? "text-info/80"
                                                : "text-muted-foreground group-hover:text-muted-foreground/80"
                                    }`}>
                                        {achievement.description}
                                    </p>
                                </div>

                                {/* Progress Section */}
                                {achievement.progress !== undefined && achievement.total && (
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground font-medium">Progress</span>
                                            <span className={`font-medium ${
                                                isUnlocked
                                                    ? "text-success"
                                                    : isInProgress
                                                        ? "text-info"
                                                        : "text-muted-foreground"
                                            }`}>
                                                {achievement.progress} / {achievement.total}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <div className="w-full bg-muted/50 rounded-full h-1.5 sm:h-2 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        isUnlocked
                                                            ? "bg-success shadow-sm"
                                                            : isInProgress
                                                                ? "bg-info"
                                                                : "bg-muted-foreground/30"
                                                    }`}
                                                    style={{ width: `${progressPercentage}%` }}
                                                ></div>
                                            </div>
                                            {isInProgress && progressPercentage > 0 && (
                                                <div className="absolute top-0 left-0 w-full h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Unlock Date */}
                                {isUnlocked && achievement.unlockedAt && (
                                    <div className="pt-1.5 sm:pt-2 border-t border-success/20">
                                        <p className="text-xs text-success/70 flex items-center gap-1">
                                            <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            <span className="truncate">Unlocked {format(new Date(achievement.unlockedAt), "MMM d, yyyy")}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Status Indicator */}
                                {!isUnlocked && (
                                    <div className="flex items-center justify-between pt-1.5 sm:pt-2">
                                        <span className={`text-xs font-medium ${
                                            isInProgress ? "text-info" : "text-muted-foreground"
                                        }`}>
                                            {isInProgress ? "In Progress" : "Not Started"}
                                        </span>
                                        {isInProgress ? (
                                            <ClockIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-info" />
                                        ) : (
                                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-muted-foreground/30"></div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Hover Glow Effect */}
                            <div className={`absolute inset-0 rounded-lg sm:rounded-xl transition-opacity duration-300 pointer-events-none ${
                                isUnlocked
                                    ? 'bg-success/5 opacity-0 group-hover:opacity-100'
                                    : isInProgress
                                        ? 'bg-info/5 opacity-0 group-hover:opacity-100'
                                        : 'bg-primary/5 opacity-0 group-hover:opacity-100'
                            }`}></div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {achievements?.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <StarIcon className="w-6 sm:w-8 h-6 sm:h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">No Achievements Yet</h3>
                    <p className="text-muted-foreground text-sm sm:text-base px-4">Complete tasks and activities to unlock your first achievements!</p>
                </div>
            )}
        </div>
    );
}
