"use client";

import { format } from "date-fns";
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    BookOpenIcon,
    MicrophoneIcon,
    MusicalNoteIcon,
    LightBulbIcon
} from "@heroicons/react/24/outline";
import { ChatBubbleLeftEllipsisIcon as QuoteIcon } from "@heroicons/react/24/outline";

interface Note {
    id: string;
    title: string;
    content: string;
    type: "GENERAL" | "BIBLE_STUDY" | "CONFERENCE" | "SONG" | "QUOTE" | "REFLECTION";
    createdAt: string;
}

interface NoteItemProps {
    note: Note;
    onDelete: (noteId: string) => Promise<void>;
    onEdit: (note: Note) => void;
    onView: (note: Note) => void;
}

export default function NoteItem({ note, onDelete, onEdit, onView }: NoteItemProps) {
    const typeConfig = {
        GENERAL: {
            color: "bg-muted text-muted-foreground border-border/50",
            activeColor: "bg-muted/80 text-foreground border-border",
            icon: BookOpenIcon,
            label: "General"
        },
        BIBLE_STUDY: {
            color: "bg-info/10 text-info border-info/20",
            activeColor: "bg-info/15 text-info border-info/30",
            icon: BookOpenIcon,
            label: "Bible Study"
        },
        CONFERENCE: {
            color: "bg-primary/10 text-primary border-primary/20",
            activeColor: "bg-primary/15 text-primary border-primary/30",
            icon: MicrophoneIcon,
            label: "Conference"
        },
        SONG: {
            color: "bg-success/10 text-success border-success/20",
            activeColor: "bg-success/15 text-success border-success/30",
            icon: MusicalNoteIcon,
            label: "Song"
        },
        QUOTE: {
            color: "bg-warning/10 text-warning border-warning/20",
            activeColor: "bg-warning/15 text-warning border-warning/30",
            icon: QuoteIcon,
            label: "Quote"
        },
        REFLECTION: {
            color: "bg-info/10 text-info border-info/20",
            activeColor: "bg-info/15 text-info border-info/30",
            icon: LightBulbIcon,
            label: "Reflection"
        },
    };

    const config = typeConfig[note.type];
    const IconComponent = config.icon;

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this note?')) {
            try {
                await onDelete(note.id);
            } catch (error) {
                console.error('Failed to delete note:', error);
            }
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 group cursor-pointer">
            <div className="space-y-3 sm:space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
                            {note.title}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${config.activeColor}`}>
                                <IconComponent className="w-3 h-3" />
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Preview */}
                <div className="bg-muted/30 rounded-lg p-3 sm:p-4 group-hover:bg-muted/50 transition-colors duration-200">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-foreground/80 transition-colors duration-200">
                        {note.content}
                    </p>
                </div>

                {/* Meta Information and Actions */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Created {format(new Date(note.createdAt), "MMM d, yyyy")}</span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onView(note);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-info hover:bg-info/10 rounded transition-all duration-200"
                            title="View note"
                        >
                            <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(note);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-all duration-200"
                            title="Edit note"
                        >
                            <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all duration-200"
                            title="Delete note"
                        >
                            <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
