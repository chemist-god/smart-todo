"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Note {
    id: string;
    title: string;
    content: string;
    type: "GENERAL" | "BIBLE_STUDY" | "CONFERENCE" | "SONG" | "QUOTE" | "REFLECTION";
    createdAt: string;
}

interface EditNoteModalProps {
    note: Note | null;
    isOpen: boolean;
    onClose: () => void;
    onNoteUpdated: () => void;
}

export default function EditNoteModal({ note, isOpen, onClose, onNoteUpdated }: EditNoteModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState<Note["type"]>("GENERAL");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setType(note.type);
            setError("");
        }
    }, [note]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note) return;

        if (!title.trim() || !content.trim()) {
            setError("Title and content are required");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch(`/api/notes/${note.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    type,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update note");
            }

            onNoteUpdated();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update note");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !note) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground">Edit Note</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-all duration-200"
                    >
                        <XMarkIcon className="w-5 w-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4">
                            <p className="text-destructive text-sm">{error}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 sm:py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm sm:text-base transition-all duration-200"
                            placeholder="Enter note title..."
                            required
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                            Type
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as Note["type"])}
                            className="w-full px-3 py-2 sm:py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm sm:text-base transition-all duration-200"
                        >
                            <option value="GENERAL">📝 General</option>
                            <option value="BIBLE_STUDY">📖 Bible Study</option>
                            <option value="CONFERENCE">🎤 Conference</option>
                            <option value="SONG">🎵 Song</option>
                            <option value="QUOTE">💬 Quote</option>
                            <option value="REFLECTION">💡 Reflection</option>
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="w-full px-3 py-2 sm:py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm sm:text-base resize-none transition-all duration-200"
                            placeholder="Write your note content here..."
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-lg hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                        >
                            {isSubmitting ? "Updating..." : "Update Note"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

