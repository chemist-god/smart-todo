"use client";

import { format } from "date-fns";
import { XMarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
    BookOpenIcon,
    MicrophoneIcon,
    MusicalNoteIcon,
    LightBulbIcon,
    ChatBubbleLeftEllipsisIcon as QuoteIcon
} from "@heroicons/react/24/outline";

interface Note {
    id: string;
    title: string;
    content: string;
    type: "GENERAL" | "BIBLE_STUDY" | "CONFERENCE" | "SONG" | "QUOTE" | "REFLECTION";
    createdAt: string;
}

interface ViewNoteModalProps {
    note: Note | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (note: Note) => void;
    onDelete: (noteId: string) => Promise<void>;
}

export default function ViewNoteModal({ note, isOpen, onClose, onEdit, onDelete }: ViewNoteModalProps) {
    if (!isOpen || !note) return null;

    const typeConfig = {
        GENERAL: {
            color: "bg-muted/50 text-muted-foreground border-border/50",
            icon: BookOpenIcon,
            label: "General"
        },
        BIBLE_STUDY: {
            color: "bg-info/10 text-info border-info/20",
            icon: BookOpenIcon,
            label: "Bible Study"
        },
        CONFERENCE: {
            color: "bg-primary/10 text-primary border-primary/20",
            icon: MicrophoneIcon,
            label: "Conference"
        },
        SONG: {
            color: "bg-success/10 text-success border-success/20",
            icon: MusicalNoteIcon,
            label: "Song"
        },
        QUOTE: {
            color: "bg-warning/10 text-warning border-warning/20",
            icon: QuoteIcon,
            label: "Quote"
        },
        REFLECTION: {
            color: "bg-info/10 text-info border-info/20",
            icon: LightBulbIcon,
            label: "Reflection"
        },
    };

    const config = typeConfig[note.type];
    const IconComponent = config.icon;

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            try {
                await onDelete(note.id);
                onClose();
            } catch (error) {
                console.error('Failed to delete note:', error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                            <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-foreground line-clamp-1">
                                {note.title}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                                    <IconComponent className="w-3 h-3" />
                                    {config.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Created {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-all duration-200"
                    >
                        <XMarkIcon className="w-5 w-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                    <div className="prose prose-sm sm:prose-base max-w-none">
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {note.content}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end p-4 sm:p-6 border-t border-border">
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive transition-all duration-200 order-3 sm:order-1"
                    >
                        <div className="flex items-center gap-2">
                            <TrashIcon className="w-4 h-4" />
                            Delete
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            onEdit(note);
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 order-2 sm:order-2"
                    >
                        <div className="flex items-center gap-2">
                            <PencilIcon className="w-4 h-4" />
                            Edit Note
                        </div>
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted border border-border rounded-lg hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 order-1 sm:order-3"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
