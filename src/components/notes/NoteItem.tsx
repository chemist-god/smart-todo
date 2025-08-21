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
    createdAt: Date;
}

interface NoteItemProps {
    note: Note;
}

export default function NoteItem({ note }: NoteItemProps) {
    const typeConfig = {
        GENERAL: {
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: BookOpenIcon,
            label: "General"
        },
        BIBLE_STUDY: {
            color: "bg-blue-100 text-blue-800 border-blue-200",
            icon: BookOpenIcon,
            label: "Bible Study"
        },
        CONFERENCE: {
            color: "bg-purple-100 text-purple-800 border-purple-200",
            icon: MicrophoneIcon,
            label: "Conference"
        },
        SONG: {
            color: "bg-green-100 text-green-800 border-green-200",
            icon: MusicalNoteIcon,
            label: "Song"
        },
        QUOTE: {
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: QuoteIcon,
            label: "Quote"
        },
        REFLECTION: {
            color: "bg-pink-100 text-pink-800 border-pink-200",
            icon: LightBulbIcon,
            label: "Reflection"
        },
    };

    const config = typeConfig[note.type];
    const IconComponent = config.icon;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {note.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                                <IconComponent className="w-3 h-3 mr-1" />
                                {config.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Preview */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {note.content}
                    </p>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created {format(new Date(note.createdAt), "MMM d, yyyy")}</span>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => {
                                // TODO: Implement view
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View note"
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                // TODO: Implement edit
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Edit note"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                // TODO: Implement delete
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete note"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
