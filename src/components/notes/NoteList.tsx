"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import NoteItem from "./NoteItem";
import EditNoteModal from "./EditNoteModal";
import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Note {
    id: string;
    title: string;
    content: string;
    type: "GENERAL" | "BIBLE_STUDY" | "CONFERENCE" | "SONG" | "QUOTE" | "REFLECTION";
    createdAt: string;
}

interface NoteListProps {
    onNoteChange?: () => void;
}

export default function NoteList({ onNoteChange }: NoteListProps) {
    const [filter, setFilter] = useState<"all" | "GENERAL" | "BIBLE_STUDY" | "CONFERENCE" | "SONG" | "QUOTE" | "REFLECTION">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [notes, setNotes] = useState<Note[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const queryKey = useMemo(() => {
        const params = new URLSearchParams();
        if (filter !== "all") params.append("filter", filter);
        if (searchQuery) params.append("search", searchQuery);
        return `/api/notes?${params.toString()}`;
    }, [filter, searchQuery]);

    const { data, isLoading, mutate } = useSWR<Note[]>(queryKey, fetcher, { revalidateOnFocus: true, refreshInterval: 30000 });

    useMemo(() => {
        if (data) setNotes(data);
    }, [data]);

    const handleNoteDelete = async (noteId: string) => {
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            // Refresh the notes list
            await mutate();

            // Notify parent component
            if (onNoteChange) {
                onNoteChange();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete note');
        }
    };

    const handleNoteEdit = (note: Note) => {
        setEditingNote(note);
        setIsEditModalOpen(true);
    };

    const handleNoteUpdated = async () => {
        // Refresh the notes list
        await mutate();

        // Notify parent component
        if (onNoteChange) {
            onNoteChange();
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingNote(null);
    };

    const filteredNotes = notes.filter((note) => {
        const matchesFilter = filter === "all" || note.type === filter;
        const matchesSearch = searchQuery === "" ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const noteTypes = [
        { value: "all", label: "All Notes", color: "bg-gray-100 text-gray-800" },
        { value: "GENERAL", label: "General", color: "bg-gray-100 text-gray-800" },
        { value: "BIBLE_STUDY", label: "Bible Study", color: "bg-blue-100 text-blue-800" },
        { value: "CONFERENCE", label: "Conference", color: "bg-purple-100 text-purple-800" },
        { value: "SONG", label: "Song", color: "bg-green-100 text-green-800" },
        { value: "QUOTE", label: "Quote", color: "bg-yellow-100 text-yellow-800" },
        { value: "REFLECTION", label: "Reflection", color: "bg-pink-100 text-pink-800" },
    ];

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className="ml-2 text-gray-600">Loading notes...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Error: {error}</p>
                    <button
                        onClick={() => mutate()}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    {/* Type Filters */}
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                        <div className="flex flex-wrap gap-1">
                            {noteTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setFilter(type.value as typeof filter)}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === type.value
                                        ? "bg-purple-100 text-purple-700 font-medium"
                                        : type.color + " hover:opacity-80"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.length === 0 ? (
                    <div className="col-span-full bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                        <p className="text-gray-500 mb-4">
                            {filter === "all" && searchQuery === ""
                                ? "Create your first note to start capturing your thoughts and insights!"
                                : searchQuery !== ""
                                    ? `No notes found matching "${searchQuery}"`
                                    : `No ${filter.toLowerCase().replace('_', ' ')} notes found.`
                            }
                        </p>
                        {filter === "all" && searchQuery === "" && (
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Your First Note
                            </button>
                        )}
                    </div>
                ) : (
                    filteredNotes.map((note) => (
                        <NoteItem
                            key={note.id}
                            note={note}
                            onDelete={handleNoteDelete}
                            onEdit={handleNoteEdit}
                        />
                    ))
                )}
            </div>

            {/* Edit Modal */}
            <EditNoteModal
                note={editingNote}
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onNoteUpdated={handleNoteUpdated}
            />
        </div>
    );
}
