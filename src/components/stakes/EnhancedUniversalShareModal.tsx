"use client";

import { useState, useEffect } from "react";
import {
    ShareIcon,
    LinkIcon,
    QrCodeIcon,
    CodeBracketIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    XMarkIcon,
    SparklesIcon,
    ArrowTopRightOnSquareIcon,
    EyeIcon,
    HeartIcon,
    FireIcon
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { SocialShareService, StakeShareData } from "@/lib/social-share-service";
import { MessageTemplateService } from "@/lib/enhanced-message-templates";
import QRCode from "qrcode";

interface EnhancedUniversalShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareData: StakeShareData;
}

export default function EnhancedUniversalShareModal({ isOpen, onClose, shareData }: EnhancedUniversalShareModalProps) {
    const [shareLinks, setShareLinks] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [customMessage, setCustomMessage] = useState("");
    const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'platforms' | 'templates' | 'advanced'>('platforms');
    const [loading, setLoading] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
    const [templates, setTemplates] = useState<any[]>([]);
    const { addToast } = useToast();

    // Platform configurations with authentic logos and colors
    const platforms = [
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: '💬',
            color: 'from-green-500 to-green-600',
            hoverColor: 'hover:from-green-600 hover:to-green-700',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700',
            description: 'Share with friends and family'
        },
        {
            id: 'twitter',
            name: 'X (Twitter)',
            icon: '🐦',
            color: 'from-black to-gray-800',
            hoverColor: 'hover:from-gray-800 hover:to-black',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            textColor: 'text-gray-700',
            description: 'Tweet your challenge'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: '💼',
            color: 'from-blue-600 to-blue-700',
            hoverColor: 'hover:from-blue-700 hover:to-blue-800',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            description: 'Professional networking'
        },
        {
            id: 'telegram',
            name: 'Telegram',
            icon: '✈️',
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:from-blue-600 hover:to-blue-700',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            description: 'Secure messaging'
        },
        {
            id: 'facebook',
            name: 'Facebook',
            icon: '📘',
            color: 'from-blue-600 to-blue-700',
            hoverColor: 'hover:from-blue-700 hover:to-blue-800',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            description: 'Social networking'
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: '📷',
            color: 'from-pink-500 via-purple-500 to-orange-500',
            hoverColor: 'hover:from-pink-600 hover:via-purple-600 hover:to-orange-600',
            bgColor: 'bg-gradient-to-r from-pink-50 to-purple-50',
            borderColor: 'border-pink-200',
            textColor: 'text-pink-700',
            description: 'Visual storytelling'
        },
        {
            id: 'discord',
            name: 'Discord',
            icon: '🎮',
            color: 'from-indigo-500 to-purple-600',
            hoverColor: 'hover:from-indigo-600 hover:to-purple-700',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            textColor: 'text-indigo-700',
            description: 'Gaming communities'
        },
        {
            id: 'reddit',
            name: 'Reddit',
            icon: '🤖',
            color: 'from-orange-500 to-red-500',
            hoverColor: 'hover:from-orange-600 hover:to-red-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-700',
            description: 'Community discussions'
        },
        {
            id: 'email',
            name: 'Email',
            icon: '📧',
            color: 'from-gray-600 to-gray-700',
            hoverColor: 'hover:from-gray-700 hover:to-gray-800',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            textColor: 'text-gray-700',
            description: 'Direct messaging'
        }
    ];

    useEffect(() => {
        if (isOpen) {
            generateShareLinks();
            loadTemplates();
            generateQRCode();
        }
    }, [isOpen, shareData]);

    const generateShareLinks = async () => {
        try {
            setLoading(true);
            const links = SocialShareService.generateShareLinks({
                ...shareData,
                templateId: selectedTemplate?.id,
                customMessage: customMessage || undefined
            });
            setShareLinks(links);
        } catch (error) {
            console.error('Error generating share links:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTemplates = async () => {
        try {
            const templateList = MessageTemplateService.getTemplatesByCategory(shareData.category);
            setTemplates(templateList);
            if (templateList.length > 0) {
                setSelectedTemplate(templateList[0]);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    };

    const generateQRCode = async () => {
        try {
            const inviteUrl = `${window.location.origin}/stakes/invite/${shareData.stakeId}`;
            const qrCodeDataUrl = await QRCode.toDataURL(inviteUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#1f2937',
                    light: '#ffffff'
                },
                errorCorrectionLevel: 'M'
            });
            setQrCodeDataUrl(qrCodeDataUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const handleTemplateSelect = (template: any) => {
        setSelectedTemplate(template);
        setCustomMessage("");
    };

    const handleCopy = async (text: string, itemId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItems(prev => new Set([...prev, itemId]));
            addToast({ type: 'success', title: 'Copied!', message: 'Link copied to clipboard' });
            setTimeout(() => {
                setCopiedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });
            }, 2000);
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'Failed to copy to clipboard' });
        }
    };

    const handlePlatformShare = (platform: any) => {
        const shareLink = shareLinks.find(link => link.platform === platform.id);
        if (shareLink) {
            window.open(shareLink.url, '_blank', 'noopener,noreferrer');
        }
    };

    const generateMessage = () => {
        if (customMessage) return customMessage;
        if (selectedTemplate) {
            return MessageTemplateService.generateMessage(selectedTemplate, shareData);
        }
        return `🔥 I'm staking Gh${shareData.amount} to ${shareData.title}! Think I can do it? Join me and let's prove the doubters wrong! 💪`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Universal Share</h2>
                                    <p className="text-purple-100 text-sm">Share your stake across all platforms</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'platforms', label: 'Platforms', icon: ShareIcon },
                                { id: 'templates', label: 'Templates', icon: CodeBracketIcon },
                                { id: 'advanced', label: 'Advanced', icon: QrCodeIcon }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-96 overflow-y-auto">
                        {activeTab === 'platforms' && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Platform</h3>
                                    <p className="text-gray-600">Share your stake with the world</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {platforms.map((platform) => (
                                        <button
                                            key={platform.id}
                                            onClick={() => handlePlatformShare(platform)}
                                            className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${platform.bgColor} ${platform.borderColor} hover:shadow-lg hover:scale-105`}
                                        >
                                            <div className="text-center">
                                                <div className="text-3xl mb-2">{platform.icon}</div>
                                                <h4 className={`font-semibold ${platform.textColor}`}>{platform.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{platform.description}</p>
                                            </div>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Templates</h3>
                                    <p className="text-gray-600">Choose a catchy message to share</p>
                                </div>

                                <div className="space-y-4">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => handleTemplateSelect(template)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl">{template.emoji}</div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{template.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{template.template}</p>
                                                </div>
                                                {selectedTemplate?.id === template.id && (
                                                    <CheckIcon className="w-5 h-5 text-purple-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Custom Message
                                    </label>
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Write your own message..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                                    <p className="text-sm text-gray-700 italic">"{generateMessage()}"</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className="space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Sharing</h3>
                                    <p className="text-gray-600">QR codes, embed codes, and direct links</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* QR Code */}
                                    <div className="text-center">
                                        <h4 className="font-medium text-gray-900 mb-4">QR Code</h4>
                                        {qrCodeDataUrl ? (
                                            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                                                <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
                                            </div>
                                        ) : (
                                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                                                <LoadingSpinner size="lg" />
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">Scan to join the stake</p>
                                    </div>

                                    {/* Direct Link */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-4">Direct Link</h4>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={`${window.location.origin}/stakes/invite/${shareData.stakeId}`}
                                                readOnly
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                                            />
                                            <button
                                                onClick={() => handleCopy(`${window.location.origin}/stakes/invite/${shareData.stakeId}`, 'direct-link')}
                                                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                {copiedItems.has('direct-link') ? (
                                                    <CheckIcon className="w-4 h-4" />
                                                ) : (
                                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Embed Code */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4">Embed Code</h4>
                                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                                        {`<iframe src="${window.location.origin}/stakes/invite/${shareData.stakeId}" width="400" height="600" frameborder="0"></iframe>`}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(`<iframe src="${window.location.origin}/stakes/invite/${shareData.stakeId}" width="400" height="600" frameborder="0"></iframe>`, 'embed-code')}
                                        className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        {copiedItems.has('embed-code') ? (
                                            <CheckIcon className="w-4 h-4" />
                                        ) : (
                                            <ClipboardDocumentIcon className="w-4 h-4" />
                                        )}
                                        Copy Embed Code
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <EyeIcon className="w-4 h-4" />
                                <span>Share your challenge with the world</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={generateShareLinks}
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading && <LoadingSpinner size="sm" />}
                                    Update Links
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
