"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HelpCategoryProps {
    category: {
        id: string;
        name: string;
        icon: React.ComponentType<{ className?: string }>;
        gradient: string;
        description: string;
    };
    isSelected: boolean;
    articleCount: number;
    onClick: () => void;
}

export default function HelpCategory({
    category,
    isSelected,
    articleCount,
    onClick
}: HelpCategoryProps) {
    const Icon = category.icon;

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border transition-all duration-300",
                "hover:shadow-lg hover:scale-[1.02] text-left",
                isSelected
                    ? "border-primary shadow-md ring-2 ring-primary/20"
                    : "border-border/50 hover:border-primary/20"
            )}
        >
            <div className={cn(
                "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                `bg-gradient-to-br ${category.gradient} opacity-5`
            )} />

            <div className="relative p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className={cn(
                        "flex-shrink-0 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br shadow-md",
                        category.gradient
                    )}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                                {category.name}
                            </h3>
                            <Badge variant="outline" className="text-[10px] sm:text-xs bg-muted/50">
                                {articleCount}
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {category.description}
                        </p>
                    </div>
                </div>
            </div>
        </button>
    );
}

