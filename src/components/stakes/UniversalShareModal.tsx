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
    ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { SocialShareService, StakeShareData } from "@/lib/social-share-service";
import { MessageTemplateService } from "@/lib/message-templates";
import QRCode from "qrcode";

interface UniversalShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareData: StakeShareData;
}

export default function UniversalShareModal({ isOpen, onClose, shareData }: UniversalShareModalProps) {
    const [shareLinks, setShareLinks] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [customMessage, setCustomMessage] = useState("");
    const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'platforms' | 'templates' | 'advanced'>('platforms');
    const [loading, setLoading] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
    const [templates, setTemplates] = useState<any[]>([]);
    const { addToast } = useToast();

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

    const handleCustomMessageChange = (message: string) => {
        setCustomMessage(message);
        setSelectedTemplate(null);
    };

    const copyToClipboard = async (text: string, itemId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItems(prev => new Set([...prev, itemId]));
            addToast({ type: 'success', title: 'Copied!', message: 'Content copied to clipboard' });

            // Remove from copied items after 2 seconds
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

    const openShareLink = (url: string, platform: string) => {
        if (platform === 'instagram' || platform === 'github') {
            // These platforms don't support direct URL sharing
            const message = shareLinks.find(link => link.platform === platform)?.description || '';
            copyToClipboard(message, platform);
            return;
        }

        window.open(url, '_blank', 'width=600,height=400');
    };

    const getPlatformIcon = (platform: string) => {
        const icons: { [key: string]: string } = {
            'whatsapp': '📱',
            'telegram': '✈️',
            'twitter': '🐦',
            'linkedin': '💼',
            'instagram': '📸',
            'facebook': '👥',
            'email': '📧',
            'github': '🐙',
            'portfolio': '🌐'
        };
        return icons[platform] || '🔗';
    };

    const getPlatformColor = (platform: string) => {
        const colors: { [key: string]: string } = {
            'whatsapp': '#25D366',
            'telegram': '#0088cc',
            'twitter': '#1DA1F2',
            'linkedin': '#0077B5',
            'instagram': '#E4405F',
            'facebook': '#1877F2',
            'email': '#EA4335',
            'github': '#333333',
            'portfolio': '#6366F1'
        };
        return colors[platform] || '#8B5CF6';
    };

    if (!isOpen) return null;

    const templates = MessageTemplateService.getTemplatesByCategory(shareData.category);
    const qrCodeData = SocialShareService.generateQRCodeData(shareData);
    const embedCode = SocialShareService.generateEmbedCode(shareData);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                            <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                            Universal Sharing
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('platforms')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'platforms'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Platforms
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Templates
                        </button>
                        <button
                            onClick={() => setActiveTab('advanced')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'advanced'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Advanced
                        </button>
                    </nav>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'platforms' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Share to Platforms</h4>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner size="lg" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {shareLinks.map((link) => (
                                        <div
                                            key={link.platform}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-2xl">{getPlatformIcon(link.platform)}</span>
                                                    <div>
                                                        <h5 className="font-semibold text-gray-900 capitalize">
                                                            {link.platform}
                                                        </h5>
                                                        <p className="text-sm text-gray-600">{link.title}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(link.url, link.platform)}
                                                    className="p-2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {copiedItems.has(link.platform) ? (
                                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => openShareLink(link.url, link.platform)}
                                                className="w-full py-2 px-4 rounded-lg text-white font-medium transition-colors"
                                                style={{ backgroundColor: getPlatformColor(link.platform) }}
                                            >
                                                Share on {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Message Templates</h4>

                            {/* Template Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleTemplateSelect(template)}
                                        className={`p-3 rounded-lg border text-left transition-colors ${selectedTemplate?.id === template.id
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            <span className="text-lg mr-2">{template.emoji}</span>
                                            <div className="flex-1">
                                                <h5 className="text-sm font-medium text-gray-900">
                                                    {template.title}
                                                </h5>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {template.category} • {template.difficulty}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Custom Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Custom Message
                                </label>
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => handleCustomMessageChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    rows={4}
                                    placeholder="Write your own provocative message..."
                                />
                            </div>

                            <button
                                onClick={generateShareLinks}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Update Share Links
                            </button>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="space-y-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Advanced Sharing</h4>

                            {/* QR Code */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <QrCodeIcon className="h-5 w-5 mr-2" />
                                    QR Code
                                </h5>
                                <p className="text-sm text-gray-600 mb-3">
                                    Share this QR code for easy access to your stake
                                </p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                                        <span className="text-xs text-gray-500">QR Code</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-mono text-gray-800 break-all">{qrCodeData}</p>
                                        <button
                                            onClick={() => copyToClipboard(qrCodeData, 'qrcode')}
                                            className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            Copy URL
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Embed Code */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <CodeBracketIcon className="h-5 w-5 mr-2" />
                                    Embed Code
                                </h5>
                                <p className="text-sm text-gray-600 mb-3">
                                    Embed this code on your website or portfolio
                                </p>
                                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm overflow-x-auto">
                                    <pre>{embedCode}</pre>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(embedCode, 'embed')}
                                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                                >
                                    Copy Embed Code
                                </button>
                            </div>

                            {/* Direct Link */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <LinkIcon className="h-5 w-5 mr-2" />
                                    Direct Link
                                </h5>
                                <p className="text-sm text-gray-600 mb-3">
                                    Share this direct link anywhere
                                </p>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={qrCodeData}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(qrCodeData, 'direct')}
                                        className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
