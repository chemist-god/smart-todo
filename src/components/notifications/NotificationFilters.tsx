"use client";

import { FunnelIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

type FilterType = 'all' | 'unread' | 'stake' | 'todo' | 'achievement' | 'system' | 'reminder';
type SortType = 'newest' | 'oldest' | 'priority';

interface NotificationFiltersProps {
    filter: FilterType;
    sort: SortType;
    onFilterChange: (filter: FilterType) => void;
    onSortChange: (sort: SortType) => void;
}

const filterOptions: { value: FilterType; label: string; count?: number }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'stake', label: 'Stakes' },
    { value: 'todo', label: 'Todos' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'system', label: 'System' },
    { value: 'reminder', label: 'Reminders' }
];

const sortOptions: { value: SortType; label: string }[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'priority', label: 'Priority' }
];

export default function NotificationFilters({
    filter,
    sort,
    onFilterChange,
    onSortChange
}: NotificationFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <FunnelIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onFilterChange(option.value)}
                        className={cn(
                            "px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200",
                            filter === option.value
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-card/50 border-border/50 hover:bg-card/80 text-xs sm:text-sm"
                    >
                        <ArrowsUpDownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Sort: {sortOptions.find(o => o.value === sort)?.label}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {sortOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            className={cn(
                                "cursor-pointer",
                                sort === option.value && "bg-primary/10 text-primary"
                            )}
                        >
                            {option.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

