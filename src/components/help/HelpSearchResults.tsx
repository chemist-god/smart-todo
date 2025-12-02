"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import HelpArticle from "./HelpArticle";

interface HelpArticle {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    popular?: boolean;
}

interface HelpSearchResultsProps {
    articles: HelpArticle[];
    query: string;
    onSelectArticle: (id: string) => void;
}

export default function HelpSearchResults({
    articles,
    query,
    onSelectArticle
}: HelpSearchResultsProps) {
    if (articles.length === 0) {
        return (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                    <div className="flex justify-center">
                        <div className="p-4 rounded-2xl bg-muted/30">
                            <MagnifyingGlassIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                            No results found
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Try searching with different keywords or browse our categories.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                        Search Results
                    </h2>
                </div>
                <Badge variant="outline" className="text-xs sm:text-sm">
                    {articles.length} result{articles.length !== 1 ? 's' : ''}
                </Badge>
            </div>
            <div className="space-y-3 sm:space-y-4">
                {articles.map((article) => (
                    <HelpArticle
                        key={article.id}
                        article={article}
                        isExpanded={false}
                        onToggle={() => onSelectArticle(article.id)}
                    />
                ))}
            </div>
        </div>
    );
}

