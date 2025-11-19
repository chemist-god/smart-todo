export interface MessageTemplate {
    id: string;
    title: string;
    template: string;
    category: string;
    difficulty: string;
    emoji: string;
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
    // Fitness & Health
    {
        id: 'fitness-1',
        title: 'Fitness Challenge',
        template: '🔥 I\'m putting ₵{amount} on the line to {goal} in {timeframe}! Think I can do it? Join me and let\'s prove the doubters wrong! 💪',
        category: 'fitness',
        difficulty: 'MEDIUM',
        emoji: '💪'
    },
    {
        id: 'fitness-2',
        title: 'Weight Loss Bet',
        template: '⚖️ I\'m staking ₵{amount} to lose {goal} by {deadline}. If I fail, you get the money. If I succeed, we both win! Who\'s in? 🎯',
        category: 'fitness',
        difficulty: 'HARD',
        emoji: '⚖️'
    },
    {
        id: 'fitness-3',
        title: 'Gym Streak',
        template: '🏋️‍♂️ I\'m betting ₵{amount} that I can hit the gym {frequency} for {timeframe}. Support me or watch me fail! 💀',
        category: 'fitness',
        difficulty: 'EASY',
        emoji: '🏋️‍♂️'
    },

    // Work & Career
    {
        id: 'work-1',
        title: 'Project Deadline',
        template: '💼 I\'m staking ₵{amount} to finish {project} by {deadline}. This is my accountability insurance! Who wants to hold me to it? 📈',
        category: 'work',
        difficulty: 'HARD',
        emoji: '💼'
    },
    {
        id: 'work-2',
        title: 'Skill Learning',
        template: '📚 I\'m putting ₵{amount} on learning {skill} in {timeframe}. If I don\'t master it, you get paid! Challenge accepted? 🧠',
        category: 'work',
        difficulty: 'MEDIUM',
        emoji: '📚'
    },
    {
        id: 'work-3',
        title: 'Job Hunt',
        template: '🎯 I\'m betting ₵{amount} that I\'ll land a job in {field} by {deadline}. Support my job hunt or profit from my failure! 💼',
        category: 'work',
        difficulty: 'EXTREME',
        emoji: '🎯'
    },

    // Learning & Skills
    {
        id: 'learning-1',
        title: 'Language Learning',
        template: '🗣️ I\'m staking ₵{amount} to become fluent in {language} by {deadline}. Think I can do it? Join the challenge! 🌍',
        category: 'learning',
        difficulty: 'HARD',
        emoji: '🗣️'
    },
    {
        id: 'learning-2',
        title: 'Coding Challenge',
        template: '💻 I\'m putting ₵{amount} on building {project} in {timeframe}. Code or cash - what\'s it gonna be? 🚀',
        category: 'learning',
        difficulty: 'MEDIUM',
        emoji: '💻'
    },
    {
        id: 'learning-3',
        title: 'Certification',
        template: '🏆 I\'m betting ₵{amount} that I\'ll pass {certification} by {deadline}. Support my study grind! 📖',
        category: 'learning',
        difficulty: 'HARD',
        emoji: '🏆'
    },

    // Personal Development
    {
        id: 'personal-1',
        title: 'Habit Formation',
        template: '🔄 I\'m staking ₵{amount} to build the habit of {habit} for {timeframe}. Will you help me stay accountable? ⏰',
        category: 'personal',
        difficulty: 'EASY',
        emoji: '🔄'
    },
    {
        id: 'personal-2',
        title: 'Social Challenge',
        template: '👥 I\'m putting ₵{amount} on {social_goal} by {deadline}. Introvert vs. Social Life - who wins? 🤝',
        category: 'personal',
        difficulty: 'MEDIUM',
        emoji: '👥'
    },
    {
        id: 'personal-3',
        title: 'Mindfulness',
        template: '🧘 I\'m betting ₵{amount} that I can meditate {frequency} for {timeframe}. Inner peace or financial loss? 🕯️',
        category: 'personal',
        difficulty: 'EASY',
        emoji: '🧘'
    },

    // Creative Projects
    {
        id: 'creative-1',
        title: 'Art Project',
        template: '🎨 I\'m staking ₵{amount} to complete {art_project} by {deadline}. Support my creative journey! ✨',
        category: 'creative',
        difficulty: 'MEDIUM',
        emoji: '🎨'
    },
    {
        id: 'creative-2',
        title: 'Writing Challenge',
        template: '✍️ I\'m putting ₵{amount} on writing {writing_goal} by {deadline}. Words or wealth - what\'s your bet? 📝',
        category: 'creative',
        difficulty: 'HARD',
        emoji: '✍️'
    },
    {
        id: 'creative-3',
        title: 'Music Creation',
        template: '🎵 I\'m betting ₵{amount} that I\'ll create {music_goal} by {deadline}. Support my musical dreams! 🎶',
        category: 'creative',
        difficulty: 'MEDIUM',
        emoji: '🎵'
    },

    // Financial Goals
    {
        id: 'financial-1',
        title: 'Savings Challenge',
        template: '💰 I\'m staking ₵{amount} to save ₵{savings_goal} by {deadline}. Money on money - let\'s go! 🏦',
        category: 'financial',
        difficulty: 'HARD',
        emoji: '💰'
    },
    {
        id: 'financial-2',
        title: 'Investment Learning',
        template: '📈 I\'m putting ₵{amount} on learning {investment_skill} by {deadline}. Financial literacy or financial loss? 💡',
        category: 'financial',
        difficulty: 'MEDIUM',
        emoji: '📈'
    },
    {
        id: 'financial-3',
        title: 'Side Hustle',
        template: '🚀 I\'m betting ₵{amount} that I\'ll launch {side_hustle} by {deadline}. Entrepreneur or employee? 🎯',
        category: 'financial',
        difficulty: 'EXTREME',
        emoji: '🚀'
    },

    // Social & Relationships
    {
        id: 'social-1',
        title: 'Networking',
        template: '🤝 I\'m staking ₵{amount} to attend {networking_events} by {deadline}. Introvert vs. Network - who wins? 📞',
        category: 'social',
        difficulty: 'MEDIUM',
        emoji: '🤝'
    },
    {
        id: 'social-2',
        title: 'Relationship Goal',
        template: '💕 I\'m putting ₵{amount} on {relationship_goal} by {deadline}. Love or money - what matters more? ❤️',
        category: 'social',
        difficulty: 'HARD',
        emoji: '💕'
    },
    {
        id: 'social-3',
        title: 'Community Service',
        template: '🌍 I\'m betting ₵{amount} that I\'ll volunteer {volunteer_hours} by {deadline}. Service or selfishness? 🤲',
        category: 'social',
        difficulty: 'EASY',
        emoji: '🌍'
    }
];

export class MessageTemplateService {
    /**
     * Get templates by category
     */
    static getTemplatesByCategory(category: string): MessageTemplate[] {
        return MESSAGE_TEMPLATES.filter(template => template.category === category);
    }

    /**
     * Get templates by difficulty
     */
    static getTemplatesByDifficulty(difficulty: string): MessageTemplate[] {
        return MESSAGE_TEMPLATES.filter(template => template.difficulty === difficulty);
    }

    /**
     * Get random template
     */
    static getRandomTemplate(): MessageTemplate {
        const randomIndex = Math.floor(Math.random() * MESSAGE_TEMPLATES.length);
        return MESSAGE_TEMPLATES[randomIndex];
    }

    /**
     * Generate personalized message
     */
    static generateMessage(
        template: MessageTemplate,
        variables: {
            amount: number;
            goal: string;
            deadline: string;
            timeframe?: string;
            [key: string]: any;
        }
    ): string {
        let message = template.template;

        // Replace common variables
        message = message.replace(/{amount}/g, variables.amount.toString());
        message = message.replace(/{goal}/g, variables.goal);
        message = message.replace(/{deadline}/g, variables.deadline);
        message = message.replace(/{timeframe}/g, variables.timeframe || 'the deadline');

        // Replace any other custom variables
        Object.keys(variables).forEach(key => {
            if (key !== 'amount' && key !== 'goal' && key !== 'deadline' && key !== 'timeframe') {
                const placeholder = `{${key}}`;
                message = message.replace(new RegExp(placeholder, 'g'), variables[key]);
            }
        });

        return message;
    }

    /**
     * Get template by ID
     */
    static getTemplateById(id: string): MessageTemplate | undefined {
        return MESSAGE_TEMPLATES.find(template => template.id === id);
    }

    /**
     * Get all categories
     */
    static getCategories(): string[] {
        return [...new Set(MESSAGE_TEMPLATES.map(template => template.category))];
    }

    /**
     * Get all difficulties
     */
    static getDifficulties(): string[] {
        return [...new Set(MESSAGE_TEMPLATES.map(template => template.difficulty))];
    }
}
