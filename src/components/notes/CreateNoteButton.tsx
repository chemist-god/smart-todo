"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Note {
    id: string;
    title: string;
    content: string;
    type: "GENERAL" | "BIBLE_STUDY" | "CONFERENCE" | "SONG" | "QUOTE" | "REFLECTION";
    createdAt: string;
}

interface CreateNoteButtonProps {
    onNoteCreated?: () => void;
}

const notesCacheKeyMatcher = (key: string) => typeof key === "string" && key.startsWith("/api/notes");
const ALL_NOTES_CACHE_KEY = "/api/notes?";

export default function CreateNoteButton({ onNoteCreated }: CreateNoteButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "GENERAL",
    });
    const [error, setError] = useState<string | null>(null);
    const { mutate } = useSWRConfig();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to create note');
            }

            const createdNote: Note = await response.json();

            await mutate(
                ALL_NOTES_CACHE_KEY,
                (current: Note[] | undefined) => {
                    if (!current) return [createdNote];
                    const filtered = current.filter((note) => note.id !== createdNote.id);
                    return [createdNote, ...filtered];
                },
                { revalidate: false }
            );

            await mutate(notesCacheKeyMatcher, undefined, { revalidate: true });

            // Reset form and close modal
            setFormData({ title: "", content: "", type: "GENERAL" });
            setIsOpen(false);

            // Notify parent component to refresh
            if (onNoteCreated) {
                onNoteCreated();
            }
        } catch (error) {
            console.error('Error creating note:', error);
            setError(error instanceof Error ? error.message : 'Failed to create note. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const noteTypes = [
        { value: "GENERAL", label: "📝 General", description: "General notes and thoughts" },
        { value: "BIBLE_STUDY", label: "📖 Bible Study", description: "Scripture insights and reflections" },
        { value: "CONFERENCE", label: "🎤 Conference", description: "Conference notes and key takeaways" },
        { value: "SONG", label: "🎵 Song", description: "Song lyrics and musical ideas" },
        { value: "QUOTE", label: "💬 Quote", description: "Inspiring quotes and sayings" },
        { value: "REFLECTION", label: "💡 Reflection", description: "Personal reflections and insights" },
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-sm sm:text-base font-medium shadow-soft hover:shadow-medium"
            >
                <PlusIcon className="h-4 w-4" />
                New Note
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl shadow-strong max-w-lg w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
                            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Create New Note</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isSubmitting}
                                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-all duration-200 disabled:opacity-50"
                            >
                                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-3 py-2">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 sm:py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm sm:text-base transition-all duration-200 disabled:opacity-50"
                                    placeholder="Note title..."
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 sm:py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm sm:text-base transition-all duration-200 disabled:opacity-50"
                                >
                                    {noteTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {noteTypes.find(t => t.value === formData.type)?.description}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                                    Content *
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 sm:py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm sm:text-base resize-none transition-all duration-200 disabled:opacity-50"
                                    placeholder="Write your note content here..."
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-lg hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 disabled:opacity-50 order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 disabled:opacity-50 order-1 sm:order-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Note'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
