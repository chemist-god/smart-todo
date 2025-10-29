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
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
            <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                <div className="relative w-full max-w-2xl sm:max-w-4xl bg-card/95 backdrop-blur-xl border border-border/50 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                    {/* Aurora Header */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 border-b border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"></div>
                        <div className="relative flex items-center justify-between p-4 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <ShareIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Share Challenge</h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Spread the word across platforms</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="group relative p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 touch-manipulation"
                            >
                                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <div className="absolute inset-0 rounded-xl bg-destructive/10 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                            </button>
                        </div>
                    </div>

                    {/* Aurora Tab Navigation */}
                    <div className="border-b border-border/30">
                        <nav className="flex space-x-1 p-1 mx-4 sm:mx-6 bg-muted/50 rounded-lg">
                            {[
                                { id: 'platforms', label: 'Platforms', icon: ShareIcon },
                                { id: 'templates', label: 'Templates', icon: CodeBracketIcon },
                                { id: 'advanced', label: 'Advanced', icon: QrCodeIcon }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 flex-1 justify-center ${activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground shadow-soft'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }`}
                                >
                                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Aurora Content */}
                    <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                        {activeTab === 'platforms' && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Choose Platform</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Share your challenge</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {platforms.map((platform) => (
                                        <button
                                            key={platform.id}
                                            onClick={() => handlePlatformShare(platform)}
                                            className="group relative bg-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:bg-card/60 hover:shadow-soft hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                                        >
                                            {/* Glass morphism overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
                                            
                                            <div className="relative text-center">
                                                <div className="text-2xl sm:text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{platform.icon}</div>
                                                <h4 className="font-semibold text-foreground text-xs sm:text-sm group-hover:text-primary transition-colors">{platform.name}</h4>
                                                <p className="text-xs text-muted-foreground/70 mt-1 hidden sm:block">{platform.description}</p>
                                            </div>
                                            
                                            {/* Hover indicator */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110">
                                                <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                                                    <ArrowTopRightOnSquareIcon className="w-3 h-3 text-primary" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'templates' && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Message Templates</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Choose your style</p>
                                </div>

                                <div className="space-y-3">
                                    {templates.map((template) => (
                                        <div
                                            key={template.id}
                                            onClick={() => handleTemplateSelect(template)}
                                            className={`group relative bg-card/40 backdrop-blur-sm border rounded-2xl p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-soft ${selectedTemplate?.id === template.id
                                                    ? 'border-primary/30 bg-primary/5'
                                                    : 'border-border/30 hover:border-primary/20 hover:bg-card/60'
                                                }`}
                                        >
                                            {/* Glass morphism overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none" />
                                            
                                            <div className="relative flex items-start gap-3">
                                                <div className="text-xl sm:text-2xl">{template.emoji}</div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-foreground text-sm sm:text-base">{template.title}</h4>
                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{template.template}</p>
                                                </div>
                                                {selectedTemplate?.id === template.id && (
                                                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                        <CheckIcon className="w-3 h-3 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Custom Message
                                    </label>
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Write your own message..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground text-sm"
                                    />
                                </div>

                                <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-3 sm:p-4">
                                    <h4 className="font-semibold text-foreground mb-2 text-sm">Preview:</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">"{generateMessage()}"</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Advanced Options</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">QR codes and embed links</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {/* QR Code */}
                                    <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-4 text-center">
                                        <h4 className="font-semibold text-foreground mb-3 text-sm">QR Code</h4>
                                        {qrCodeDataUrl ? (
                                            <div className="bg-card p-3 rounded-xl border border-border/30 inline-block">
                                                <img src={qrCodeDataUrl} alt="QR Code" className="w-32 h-32 sm:w-40 sm:h-40" />
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-muted/30 rounded-xl flex items-center justify-center mx-auto">
                                                <LoadingSpinner size="lg" />
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2">Scan to join</p>
                                    </div>

                                    {/* Direct Link */}
                                    <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-4">
                                        <h4 className="font-semibold text-foreground mb-3 text-sm">Direct Link</h4>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={`${window.location.origin}/stakes/invite/${shareData.stakeId}`}
                                                readOnly
                                                className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-xs text-muted-foreground"
                                            />
                                            <button
                                                onClick={() => handleCopy(`${window.location.origin}/stakes/invite/${shareData.stakeId}`, 'direct-link')}
                                                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
                                <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-4">
                                    <h4 className="font-semibold text-foreground mb-3 text-sm">Embed Code</h4>
                                    <div className="bg-muted p-3 rounded-xl font-mono text-xs overflow-x-auto text-muted-foreground">
                                        {`<iframe src="${window.location.origin}/stakes/invite/${shareData.stakeId}" width="400" height="600" frameborder="0"></iframe>`}
                                    </div>
                                    <button
                                        onClick={() => handleCopy(`<iframe src="${window.location.origin}/stakes/invite/${shareData.stakeId}" width="400" height="600" frameborder="0"></iframe>`, 'embed-code')}
                                        className="mt-3 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        {copiedItems.has('embed-code') ? (
                                            <CheckIcon className="w-4 h-4" />
                                        ) : (
                                            <ClipboardDocumentIcon className="w-4 h-4" />
                                        )}
                                        Copy Code
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Aurora Footer */}
                    <div className="bg-muted/30 px-4 sm:px-6 py-3 sm:py-4 border-t border-border/30">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <div className="w-4 h-4 bg-info/20 rounded-full flex items-center justify-center">
                                    <EyeIcon className="w-3 h-3 text-info" />
                                </div>
                                <span>Spread the challenge</span>
                            </div>
                            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={onClose}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={generateShareLinks}
                                    disabled={loading}
                                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    {loading && <LoadingSpinner size="sm" />}
                                    <span>Update Links</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
