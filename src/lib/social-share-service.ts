import { MessageTemplateService } from "./message-templates";

export interface SharePlatform {
    id: string;
    name: string;
    icon: string;
    color: string;
    url: string;
    enabled: boolean;
}

export interface ShareLink {
    platform: string;
    url: string;
    title: string;
    description: string;
    image?: string;
    hashtags: string[];
}

export interface StakeShareData {
    stakeId: string;
    title: string;
    description: string;
    amount: number;
    deadline: string;
    category: string;
    difficulty: string;
    inviterName: string;
    inviterImage?: string;
    templateId?: string;
    customMessage?: string;
}

export class SocialShareService {
    private static readonly PLATFORMS: SharePlatform[] = [
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: '📱',
            color: '#25D366',
            url: 'https://wa.me/',
            enabled: true
        },
        {
            id: 'telegram',
            name: 'Telegram',
            icon: '✈️',
            color: '#0088cc',
            url: 'https://t.me/share/url',
            enabled: true
        },
        {
            id: 'twitter',
            name: 'X (Twitter)',
            icon: '🐦',
            color: '#1DA1F2',
            url: 'https://twitter.com/intent/tweet',
            enabled: true
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: '💼',
            color: '#0077B5',
            url: 'https://www.linkedin.com/sharing/share-offsite',
            enabled: true
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: '📸',
            color: '#E4405F',
            url: 'https://www.instagram.com/',
            enabled: true
        },
        {
            id: 'facebook',
            name: 'Facebook',
            icon: '👥',
            color: '#1877F2',
            url: 'https://www.facebook.com/sharer/sharer.php',
            enabled: true
        },
        {
            id: 'email',
            name: 'Email',
            icon: '📧',
            color: '#EA4335',
            url: 'mailto:',
            enabled: true
        },
        {
            id: 'github',
            name: 'GitHub',
            icon: '🐙',
            color: '#333333',
            url: 'https://github.com/',
            enabled: true
        },
        {
            id: 'portfolio',
            name: 'Portfolio',
            icon: '🌐',
            color: '#6366F1',
            url: 'https://yourportfolio.com/',
            enabled: true
        }
    ];

    /**
     * Generate share links for all platforms
     */
    static generateShareLinks(shareData: StakeShareData): ShareLink[] {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const inviteUrl = `${baseUrl}/stakes/invite/${shareData.stakeId}`;

        // Generate message
        let message = shareData.customMessage;
        if (!message && shareData.templateId) {
            const template = MessageTemplateService.getTemplateById(shareData.templateId);
            if (template) {
                const variables = {
                    amount: shareData.amount,
                    goal: shareData.title,
                    deadline: new Date(shareData.deadline).toLocaleDateString(),
                    timeframe: this.getTimeframe(shareData.deadline),
                    ...this.getCategorySpecificVariables(shareData.category, shareData.title)
                };
                message = MessageTemplateService.generateMessage(template, variables);
            }
        }

        if (!message) {
            message = `🔥 I'm staking ₵${shareData.amount} to ${shareData.title} by ${new Date(shareData.deadline).toLocaleDateString()}! Think I can do it? Join me and let's prove the doubters wrong! 💪`;
        }

        const hashtags = this.generateHashtags(shareData);
        const fullMessage = `${message}\n\n${inviteUrl}`;

        return this.PLATFORMS
            .filter(platform => platform.enabled)
            .map(platform => this.generatePlatformLink(platform, fullMessage, inviteUrl, shareData, hashtags));
    }

    /**
     * Generate platform-specific share link
     */
    private static generatePlatformLink(
        platform: SharePlatform,
        message: string,
        url: string,
        shareData: StakeShareData,
        hashtags: string[]
    ): ShareLink {
        const encodedMessage = encodeURIComponent(message);
        const encodedUrl = encodeURIComponent(url);
        const encodedTitle = encodeURIComponent(shareData.title);

        let shareUrl = '';
        const title = `Join ${shareData.inviterName}'s Stake: ${shareData.title}`;
        const description = `Support ${shareData.inviterName} in completing their goal: ${shareData.title}. Stake: ₵${shareData.amount}`;

        switch (platform.id) {
            case 'whatsapp':
                shareUrl = `${platform.url}?text=${encodedMessage}`;
                break;

            case 'telegram':
                shareUrl = `${platform.url}?url=${encodedUrl}&text=${encodedMessage}`;
                break;

            case 'twitter':
                const twitterMessage = `${message} ${hashtags.join(' ')}`;
                shareUrl = `${platform.url}?text=${encodeURIComponent(twitterMessage)}&url=${encodedUrl}`;
                break;

            case 'linkedin':
                shareUrl = `${platform.url}?url=${encodedUrl}&title=${encodedTitle}&summary=${encodeURIComponent(description)}`;
                break;

            case 'instagram':
                // Instagram doesn't support direct URL sharing, so we provide the text to copy
                shareUrl = `https://www.instagram.com/`;
                break;

            case 'facebook':
                shareUrl = `${platform.url}?u=${encodedUrl}&quote=${encodedMessage}`;
                break;

            case 'email':
                const emailSubject = `Join my stake: ${shareData.title}`;
                const emailBody = `${message}\n\nClick here to join: ${url}`;
                shareUrl = `${platform.url}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                break;

            case 'github':
                // GitHub doesn't support direct sharing, so we provide the text to copy
                shareUrl = `https://github.com/`;
                break;

            case 'portfolio':
                // Portfolio sharing - customize this URL
                shareUrl = `${platform.url}?stake=${shareData.stakeId}`;
                break;

            default:
                shareUrl = url;
        }

        return {
            platform: platform.id,
            url: shareUrl,
            title,
            description,
            hashtags
        };
    }

    /**
     * Generate hashtags based on stake data
     */
    private static generateHashtags(shareData: StakeShareData): string[] {
        const baseHashtags = [
            'SmartStake',
            'Accountability',
            'GoalSetting',
            'Motivation'
        ];

        const categoryHashtags = {
            'fitness': ['Fitness', 'Health', 'Workout', 'FitnessGoals'],
            'work': ['Career', 'Professional', 'WorkGoals', 'Productivity'],
            'learning': ['Learning', 'Education', 'Skills', 'PersonalGrowth'],
            'creative': ['Creative', 'Art', 'Design', 'Innovation'],
            'personal': ['PersonalDevelopment', 'SelfImprovement', 'Growth'],
            'social': ['Social', 'Relationships', 'Community'],
            'financial': ['Financial', 'Money', 'Investment', 'Wealth']
        };

        const difficultyHashtags = {
            'EASY': ['EasyChallenge'],
            'MEDIUM': ['MediumChallenge'],
            'HARD': ['HardChallenge', 'ChallengeAccepted'],
            'EXTREME': ['ExtremeChallenge', 'NoPainNoGain']
        };

        const categoryTags = categoryHashtags[shareData.category as keyof typeof categoryHashtags] || [];
        const difficultyTags = difficultyHashtags[shareData.difficulty as keyof typeof difficultyHashtags] || [];

        return [...baseHashtags, ...categoryTags, ...difficultyTags];
    }

    /**
     * Get timeframe description
     */
    private static getTimeframe(deadline: string): string {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) return "today";
        if (diffDays <= 7) return "this week";
        if (diffDays <= 30) return "this month";
        if (diffDays <= 90) return "this quarter";
        return "this year";
    }

    /**
     * Get category-specific variables
     */
    private static getCategorySpecificVariables(category: string, title: string) {
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
    }

    /**
     * Get all available platforms
     */
    static getPlatforms(): SharePlatform[] {
        return this.PLATFORMS.filter(platform => platform.enabled);
    }

    /**
     * Generate QR code data for sharing
     */
    static generateQRCodeData(shareData: StakeShareData): string {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return `${baseUrl}/stakes/invite/${shareData.stakeId}`;
    }

    /**
     * Generate embed code for websites
     */
    static generateEmbedCode(shareData: StakeShareData): string {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const inviteUrl = `${baseUrl}/stakes/invite/${shareData.stakeId}`;

        return `
<div style="border: 2px solid #8B5CF6; border-radius: 12px; padding: 20px; max-width: 400px; font-family: Arial, sans-serif;">
    <h3 style="color: #8B5CF6; margin: 0 0 10px 0;">🔥 Stake Challenge</h3>
    <p style="margin: 0 0 15px 0; font-weight: bold;">${shareData.title}</p>
    <p style="margin: 0 0 15px 0; color: #666;">Stake: <strong>₵${shareData.amount}</strong> | Deadline: ${new Date(shareData.deadline).toLocaleDateString()}</p>
    <a href="${inviteUrl}" style="background: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Join & Support
    </a>
</div>`;
    }
}
