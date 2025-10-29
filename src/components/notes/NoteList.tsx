"use client";

import { useState, useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import NoteItem from "./NoteItem";
import EditNoteModal from "./EditNoteModal";
import ViewNoteModal from "./ViewNoteModal";
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
    const [error, setError] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [viewingNote, setViewingNote] = useState<Note | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const { mutate: globalMutate } = useSWRConfig();

    const notesCacheKeyMatcher = (key: string) => typeof key === "string" && key.startsWith("/api/notes");

    const queryKey = useMemo(() => {
        const params = new URLSearchParams();
        if (filter !== "all") params.append("filter", filter);
        if (searchQuery) params.append("search", searchQuery);
        return `/api/notes?${params.toString()}`;
    }, [filter, searchQuery]);

    const { data: notes, isLoading, mutate } = useSWR<Note[]>(queryKey, fetcher, { revalidateOnFocus: true, refreshInterval: 30000 });

    const handleNoteDelete = async (noteId: string) => {
        try {
            setError(null);
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            // Refresh the notes list
            await mutate();
            await globalMutate(notesCacheKeyMatcher, undefined, { revalidate: true });

            // Notify parent component
            if (onNoteChange) {
                onNoteChange();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete note');
        }
    };

    const handleNoteView = (note: Note) => {
        setViewingNote(note);
        setIsViewModalOpen(true);
    };

    const handleNoteEdit = (note: Note) => {
        setEditingNote(note);
        setIsEditModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setViewingNote(null);
        setIsViewModalOpen(false);
    };

    const handleNoteUpdated = async () => {
        // Refresh the notes list
        await mutate();
        await globalMutate(notesCacheKeyMatcher, undefined, { revalidate: true });

        // Notify parent component
        if (onNoteChange) {
            onNoteChange();
        }
    };

    const handleCloseEditModal = () => {
        setEditingNote(null);
        setIsEditModalOpen(false);
    };

    const filteredNotes = useMemo(() => {
        if (!notes) return [];
        return notes.filter((note) => {
            const matchesFilter = filter === "all" || note.type === filter;
            const matchesSearch = searchQuery === "" ||
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [notes, filter, searchQuery]);

    const noteTypes = [
        { value: "all", label: "All Notes", color: "bg-muted text-muted-foreground border-border/50", activeColor: "bg-primary/10 text-primary border-primary/20" },
        { value: "GENERAL", label: "General", color: "bg-muted text-muted-foreground border-border/50", activeColor: "bg-muted/50 text-muted-foreground border-border/50" },
        { value: "BIBLE_STUDY", label: "Bible Study", color: "bg-info/10 text-info border-info/20", activeColor: "bg-info/15 text-info border-info/30" },
        { value: "CONFERENCE", label: "Conference", color: "bg-primary/10 text-primary border-primary/20", activeColor: "bg-primary/15 text-primary border-primary/30" },
        { value: "SONG", label: "Song", color: "bg-success/10 text-success border-success/20", activeColor: "bg-success/15 text-success border-success/30" },
        { value: "QUOTE", label: "Quote", color: "bg-warning/10 text-warning border-warning/20", activeColor: "bg-warning/15 text-warning border-warning/30" },
        { value: "REFLECTION", label: "Reflection", color: "bg-info/10 text-info border-info/20", activeColor: "bg-info/15 text-info border-info/30" },
    ];

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <div className="bg-card p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft">
                    <div className="flex items-center justify-center py-6 sm:py-8">
                        <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">Loading notes...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg sm:rounded-xl p-4 sm:p-6">
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
            {/* Search and Filters */}
            <div className="bg-card p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border shadow-soft">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-input bg-background rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm sm:text-base transition-all duration-200"
                        />
                    </div>

                    {/* Type Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                            <FunnelIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Filter:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {noteTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setFilter(type.value as typeof filter)}
                                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-all duration-200 ${
                                        filter === type.value
                                            ? type.activeColor + " font-medium shadow-sm"
                                            : type.color + " hover:opacity-80 hover:shadow-sm"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {filteredNotes.length === 0 ? (
                    <div className="col-span-full bg-card p-6 sm:p-8 rounded-lg sm:rounded-xl border border-border shadow-soft text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <svg className="w-6 sm:w-8 h-6 sm:h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">No notes found</h3>
                        <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4 px-4">
                            {filter === "all" && searchQuery === ""
                                ? "Create your first note to start capturing your thoughts and insights!"
                                : searchQuery !== ""
                                    ? `No notes found matching "${searchQuery}"`
                                    : `No ${filter.toLowerCase().replace('_', ' ')} notes found.`
                            }
                        </p>
                        {filter === "all" && searchQuery === "" && (
                            <button className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-sm sm:text-base font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            onView={handleNoteView}
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

            {/* View Modal */}
            <ViewNoteModal
                note={viewingNote}
                isOpen={isViewModalOpen}
                onClose={handleCloseViewModal}
                onEdit={handleNoteEdit}
                onDelete={handleNoteDelete}
            />
        </div>
    );
}
