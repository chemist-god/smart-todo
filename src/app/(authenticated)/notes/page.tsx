"use client";

import { useState, useEffect } from "react";
import NoteList from "@/components/notes/NoteList";
import CreateNoteButton from "@/components/notes/CreateNoteButton";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface Stats {
    notesCreated: number;
}

export default function NotesPage() {
    const [stats, setStats] = useState<Stats>({
        notesCreated: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats');
            if (response.ok) {
                const data = await response.json();
                setStats({
                    notesCreated: data.notesCreated,
                });
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
                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Conference</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Song</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-pink-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Quote</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Reflection</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
            </div>

            <NoteList onNoteChange={handleNoteCreated} />
        </div>
    );
}
