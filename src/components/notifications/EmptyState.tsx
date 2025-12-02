"use client";

import { BellIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    searchQuery: string;
    filter: string;
    onClearFilters: () => void;
}

export default function EmptyState({ searchQuery, filter, onClearFilters }: EmptyStateProps) {
    const hasActiveFilters = searchQuery || filter !== 'all';

    return (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                        <BellIcon className="h-8 w-8 sm:h-12 sm:w-12 text-primary/60" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                        {hasActiveFilters ? 'No notifications found' : 'All caught up!'}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        {hasActiveFilters
                            ? "Try adjusting your filters or search query to see more notifications."
                            : "You're all set! New notifications will appear here when they arrive."}
                    </p>
                </div>
                {hasActiveFilters && (
                    <Button
                        onClick={onClearFilters}
                        variant="outline"
                        size="sm"
                        className="bg-card/50 border-border/50 hover:bg-card/80"
                    >
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Clear filters
                    </Button>
                )}
            </div>
        </div>
    );
}

