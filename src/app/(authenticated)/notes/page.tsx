"use client";

import { useState, useEffect } from "react";
import NoteList from "@/components/notes/NoteList";
import CreateNoteButton from "@/components/notes/CreateNoteButton";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface Stats {
    notesCreated: number;
    categoryCount: {
        GENERAL: number;
        BIBLE_STUDY: number;
        CONFERENCE: number;
        SONG: number;
        QUOTE: number;
        REFLECTION: number;
    };
}

export default function NotesPage() {
    const [stats, setStats] = useState<Stats>({
        notesCreated: 0,
        categoryCount: {
            GENERAL: 0,
            BIBLE_STUDY: 0,
            CONFERENCE: 0,
            SONG: 0,
            QUOTE: 0,
            REFLECTION: 0
        }
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleNoteCreated = () => {
        // Refresh stats when a note is created
        fetchStats();
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Notes</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Capture your thoughts, ideas, and insights</p>
                </div>
                <CreateNoteButton onNoteCreated={handleNoteCreated} />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <DocumentTextIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground block">Total</span>
                            <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                                {loading ? "..." : stats.notesCreated}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-muted/50 rounded-lg">
                            <DocumentTextIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground block">General</span>
                            <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                                {loading ? "..." : stats.categoryCount.GENERAL}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-info/10 rounded-lg">
                            <DocumentTextIcon className="w-4 h-4 text-info" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground block">Bible Study</span>
                            <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                                {loading ? "..." : stats.categoryCount.BIBLE_STUDY}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <DocumentTextIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground block">Conference</span>
                            <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                                {loading ? "..." : stats.categoryCount.CONFERENCE}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                            <DocumentTextIcon className="w-4 h-4 text-success" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground block">Song</span>
                            <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                                {loading ? "..." : stats.categoryCount.SONG}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-3 sm:p-4 rounded-lg sm:rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                            <DocumentTextIcon className="w-4 h-4 text-warning" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground block">Quote</span>
                            <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                                {loading ? "..." : stats.categoryCount.QUOTE}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <NoteList onNoteChange={handleNoteCreated} />
        </div>
    );
}
