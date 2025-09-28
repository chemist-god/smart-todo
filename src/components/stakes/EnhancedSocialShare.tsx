"use client";

import { useState, useEffect } from "react";
import {
    ShareIcon,
    LinkIcon,
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    SparklesIcon,
    XMarkIcon,
    CheckIcon
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MessageTemplateService, MessageTemplate } from "@/lib/message-templates";
import UniversalShareModal from "./UniversalShareModal";

interface EnhancedSocialShareProps {
    stakeId: string;
    stakeTitle: string;
    stakeAmount: number;
    stakeDescription?: string;
    deadline: string;
    category: string;
    difficulty: string;
    onShareSent: () => void;
}

export default function EnhancedSocialShare({
    stakeId,
    stakeTitle,
    stakeAmount,
    stakeDescription,
    deadline,
    category,
    difficulty,
    onShareSent
}: EnhancedSocialShareProps) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [showUniversalModal, setShowUniversalModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
    const [customMessage, setCustomMessage] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const { addToast } = useToast();

    const inviteLink = `${window.location.origin}/stakes/invite/${stakeId}`;

    useEffect(() => {
        // Load templates based on category and difficulty
        const categoryTemplates = MessageTemplateService.getTemplatesByCategory(category);
        const difficultyTemplates = MessageTemplateService.getTemplatesByDifficulty(difficulty);

        // Combine and deduplicate
        const allTemplates = [...categoryTemplates, ...difficultyTemplates];
        const uniqueTemplates = allTemplates.filter((template, index, self) =>
            index === self.findIndex(t => t.id === template.id)
        );

        setTemplates(uniqueTemplates);

        // Set default template
        if (uniqueTemplates.length > 0) {
            setSelectedTemplate(uniqueTemplates[0]);
        }
    }, [category, difficulty]);

    const generateMessage = () => {
        if (!selectedTemplate) return "";

        const variables = {
            amount: stakeAmount,
            goal: stakeTitle,
            deadline: new Date(deadline).toLocaleDateString(),
            timeframe: getTimeframe(deadline),
            project: stakeTitle,
            skill: stakeTitle,
            habit: stakeTitle,
            // Add more specific variables based on category
            ...getCategorySpecificVariables(category, stakeTitle)
        };

        return MessageTemplateService.generateMessage(selectedTemplate, variables);
    };

    const getCategorySpecificVariables = (category: string, title: string) => {
        switch (category) {
            case 'fitness':
                return { weight_goal: title, exercise: title };
            case 'work':
                return { project: title, skill: title, field: title };
            case 'learning':
                return { language: title, skill: title, certification: title };
            case 'creative':
                return { art_project: title, writing_goal: title, music_goal: title };
            case 'financial':
                return { savings_goal: title, investment_skill: title, side_hustle: title };
            case 'social':
                return { networking_events: title, relationship_goal: title, volunteer_hours: title };
            default:
                return {};
        }
    };

    const getTimeframe = (deadline: string) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) return "today";
        if (diffDays <= 7) return "this week";
        if (diffDays <= 30) return "this month";
        if (diffDays <= 90) return "this quarter";
        return "this year";
    };

    const handleEmailShare = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            addToast({ type: 'error', title: 'Error', message: 'Please enter an email address' });
            return;
        }

        try {
            setIsLoading(true);
            const message = customMessage || generateMessage();

            const response = await fetch('/api/stakes/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stakeId,
                    email: email.trim(),
                    message
                }),
            });

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Invitation Sent!',
                    message: `Your provocative message was sent to ${email}`
                });
                setEmail("");
                setCustomMessage("");
                setShowShareModal(false);
                onShareSent();
            } else {
                const error = await response.json();
                addToast({ type: 'error', title: 'Error', message: error.error || "Failed to send invitation" });
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: "An error occurred while sending invitation" });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            addToast({ type: 'success', title: 'Copied!', message: 'Message copied to clipboard' });
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'Failed to copy message' });
        }
    };

    const shareToSocial = async () => {
        const message = customMessage || generateMessage();
        const shareText = `${message}\n\n${inviteLink}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join My Stake: ${stakeTitle}`,
                    text: shareText,
                    url: inviteLink
                });
            } catch (error) {
                // User cancelled sharing
            }
        } else {
            await copyToClipboard(shareText);
        }
    };

    const currentMessage = customMessage || generateMessage();

    return (
        <>
            {/* Quick Share Buttons */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    <SparklesIcon className="h-4 w-4 mr-2 text-purple-600" />
                    Provocative Sharing
                </h4>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setShowUniversalModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 flex items-center justify-center"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Universal Share
                    </button>

                    <button
                        onClick={() => setShowShareModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                        Email Share
                    </button>
                </div>

                <button
                    onClick={shareToSocial}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share Everywhere
                </button>
            </div>

            {/* Enhanced Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                    <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                                    Create Provocative Message
                                </h3>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {/* Template Selection */}
                            {templates.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Choose a Template</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {templates.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => setSelectedTemplate(template)}
                                                className={`p-3 rounded-lg border text-left transition-colors ${selectedTemplate?.id === template.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start">
                                                    <span className="text-lg mr-2">{template.emoji}</span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-sm font-medium text-gray-900">
                                                                {template.title}
                                                            </h5>
                                                            {selectedTemplate?.id === template.id && (
                                                                <CheckIcon className="h-4 w-4 text-purple-600" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {template.category} • {template.difficulty}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Message Preview */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Message Preview</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {currentMessage}
                                    </p>
                                    <div className="mt-2 text-xs text-gray-500">
                                        {inviteLink}
                                    </div>
                                </div>
                            </div>

                            {/* Custom Message */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Customize Message</h4>
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    rows={4}
                                    placeholder="Or write your own provocative message..."
                                />
                            </div>

                            {/* Email Invitation */}
                            <form onSubmit={handleEmailShare} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Send via Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="friend@example.com"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowShareModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !email.trim()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                                        Send Provocative Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Universal Share Modal */}
            <UniversalShareModal
                isOpen={showUniversalModal}
                onClose={() => setShowUniversalModal(false)}
                shareData={{
                    stakeId,
                    title: stakeTitle,
                    description: stakeDescription || '',
                    amount: stakeAmount,
                    deadline,
                    category,
                    difficulty,
                    inviterName: 'You', // This would come from user context
                    inviterImage: undefined,
                    templateId: selectedTemplate?.id,
                    customMessage: customMessage || undefined
                }}
            />
        </>
    );
}
