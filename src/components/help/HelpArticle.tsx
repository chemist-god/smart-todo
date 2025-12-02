"use client";

import React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HelpArticleProps {
    article: {
        id: string;
        title: string;
        content: string;
        category: string;
        tags: string[];
        popular?: boolean;
    };
    isExpanded: boolean;
    onToggle: () => void;
}

export default function HelpArticle({ article, isExpanded, onToggle }: HelpArticleProps) {
    const [localExpanded, setLocalExpanded] = React.useState(isExpanded);

    React.useEffect(() => {
        setLocalExpanded(isExpanded);
    }, [isExpanded]);

    const handleToggle = () => {
        setLocalExpanded(!localExpanded);
        onToggle();
    };
    // Simple markdown-like formatting
    const formatContent = (content: string) => {
        return content
            .split('\n\n')
            .map((paragraph, index) => {
                // Handle bold text
                if (paragraph.includes('**')) {
                    const parts = paragraph.split('**');
                    return (
                        <p key={index} className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {parts.map((part, i) => 
                                i % 2 === 1 ? (
                                    <strong key={i} className="font-semibold text-foreground">{part}</strong>
                                ) : (
                                    <span key={i}>{part}</span>
                                )
                            )}
                        </p>
                    );
                }
                // Handle lists
                if (paragraph.includes('- ')) {
                    const items = paragraph.split('\n').filter(item => item.trim().startsWith('- '));
                    if (items.length > 0) {
                        return (
                            <ul key={index} className="list-disc list-inside space-y-1.5 text-sm sm:text-base text-muted-foreground ml-2">
                                {items.map((item, i) => (
                                    <li key={i}>{item.replace(/^-\s*/, '')}</li>
                                ))}
                            </ul>
                        );
                    }
                }
                // Regular paragraph
                if (paragraph.trim()) {
                    return (
                        <p key={index} className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {paragraph}
                        </p>
                    );
                }
                return null;
            })
            .filter(Boolean);
    };

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300",
                "hover:shadow-lg",
                isExpanded && "shadow-md border-primary/20"
            )}
        >
            <button
                onClick={handleToggle}
                className="w-full p-4 sm:p-5 text-left"
            >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1 sm:mb-2">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                                {article.title}
                            </h3>
                            {article.popular && (
                                <Badge variant="outline" className="text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/20">
                                    Popular
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {article.tags.slice(0, 3).map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-[10px] sm:text-xs bg-muted/50 text-muted-foreground"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        {localExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                    </div>
                </div>
            </button>

            {localExpanded && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-border/50 pt-4 sm:pt-5">
                    <div className="space-y-3 sm:space-y-4">
                        {formatContent(article.content)}
                    </div>
                </div>
            )}
        </div>
    );
}

