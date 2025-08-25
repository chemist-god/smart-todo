"use client";

import { useState, useEffect } from "react";
import NoteList from "@/components/notes/NoteList";
import CreateNoteButton from "@/components/notes/CreateNoteButton";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface Stats {
    notesCreated: number;
    categoryCount: {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
                    <p className="text-gray-600">Capture your thoughts, ideas, and insights</p>
                </div>
                <CreateNoteButton onNoteCreated={handleNoteCreated} />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : stats.notesCreated}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Bible Study</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        {loading ? "..." : stats.categoryCount.BIBLE_STUDY}
                    </p>
                </div>
                {/* Update other category counts similarly */}
            </div>

            <NoteList onNoteChange={handleNoteCreated} />
        </div>
    );
}
