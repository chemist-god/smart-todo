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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Note</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter note title..."
                            required
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <select
                            id="type"
                            value={type}
                            onChange={(e) => setType(e.target.value as Note["type"])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="GENERAL">General</option>
                            <option value="BIBLE_STUDY">Bible Study</option>
                            <option value="CONFERENCE">Conference</option>
                            <option value="SONG">Song</option>
                            <option value="QUOTE">Quote</option>
                            <option value="REFLECTION">Reflection</option>
                        </select>
                    </div>

                    {/* Content */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                            placeholder="Write your note content here..."
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Updating..." : "Update Note"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

