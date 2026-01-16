export interface MessageTemplate {
    id: string;
    title: string;
    template: string;
    category: string;
    difficulty: string;
    emoji: string;
    description: string;
    hashtags: string[];
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
    // Fitness & Health - More Engaging
    {
        id: 'fitness-challenge-1',
        title: 'Fitness Challenge',
        template: '🔥 CHALLENGE ALERT! I\'m putting ₵{amount} on the line to {title}! Think I\'ll fail? Think again! 💪 Join me and let\'s turn doubters into believers!',
        category: 'fitness',
        difficulty: 'MEDIUM',
        emoji: '💪',
        description: 'Motivational fitness challenge',
        hashtags: ['#FitnessChallenge', '#StakeToWin', '#NoExcuses', '#FitnessMotivation']
    },
    {
        id: 'fitness-challenge-2',
        title: 'Weight Loss Bet',
        template: '⚖️ BET AGAINST ME! I\'m staking ₵{amount} to {title} by {deadline}. If I fail, you get the money. If I succeed, we both win! Who\'s brave enough? 🎯',
        category: 'fitness',
        difficulty: 'HARD',
        emoji: '⚖️',
        description: 'High-stakes weight loss challenge',
        hashtags: ['#WeightLoss', '#BetOnMe', '#FitnessBet', '#ChallengeAccepted']
    },
    {
        id: 'fitness-challenge-3',
        title: 'Gym Streak',
        template: '🏋️‍♂️ STREAK ALERT! I\'m betting ₵{amount} that I can {title} for {timeframe}. Support me or watch me fail! 💀 This is where legends are made!',
        category: 'fitness',
        difficulty: 'EASY',
        emoji: '🏋️‍♂️',
        description: 'Gym consistency challenge',
        hashtags: ['#GymStreak', '#Consistency', '#FitnessJourney', '#NoDaysOff']
    },
    {
        id: 'fitness-challenge-4',
        title: 'Transformation',
        template: '🌟 TRANSFORMATION TIME! I\'m staking ₵{amount} to {title}! This is my "before" - help me create an epic "after"! 🚀 Let\'s make this legendary!',
        category: 'fitness',
        difficulty: 'HARD',
        emoji: '🌟',
        description: 'Body transformation challenge',
        hashtags: ['#Transformation', '#GlowUp', '#FitnessJourney', '#BeastMode']
    },

    // Work & Career - More Professional
    {
        id: 'work-challenge-1',
        title: 'Project Deadline',
        template: '💼 PROJECT COMMITMENT! I\'m staking ₵{amount} to {title} by {deadline}. This is my accountability insurance! Who wants to hold me to it? 📈 Let\'s build something amazing!',
        category: 'work',
        difficulty: 'HARD',
        emoji: '💼',
        description: 'Professional project commitment',
        hashtags: ['#ProjectCommitment', '#Accountability', '#ProfessionalGrowth', '#DeadlineChallenge']
    },
    {
        id: 'work-challenge-2',
        title: 'Skill Learning',
        template: '📚 SKILL UP CHALLENGE! I\'m putting ₵{amount} on learning {title} in {timeframe}. If I don\'t master it, you get paid! Challenge accepted? 🧠 Let\'s level up together!',
        category: 'work',
        difficulty: 'MEDIUM',
        emoji: '📚',
        description: 'Professional skill development',
        hashtags: ['#SkillUp', '#Learning', '#ProfessionalDevelopment', '#ChallengeAccepted']
    },
    {
        id: 'work-challenge-3',
        title: 'Career Goal',
        template: '🎯 CAREER BET! I\'m staking ₵{amount} to {title} by {deadline}. This is my career insurance policy! Who\'s ready to bet on my success? 🚀 Let\'s make it happen!',
        category: 'work',
        difficulty: 'HARD',
        emoji: '🎯',
        description: 'Career advancement challenge',
        hashtags: ['#CareerGoals', '#ProfessionalGrowth', '#SuccessMindset', '#CareerBet']
    },
    {
        id: 'work-challenge-4',
        title: 'Productivity Challenge',
        template: '⚡ PRODUCTIVITY BOOST! I\'m betting ₵{amount} that I can {title} for {timeframe}. This is my productivity insurance! Who\'s ready to see me crush it? 💪',
        category: 'work',
        difficulty: 'MEDIUM',
        emoji: '⚡',
        description: 'Productivity improvement challenge',
        hashtags: ['#Productivity', '#Efficiency', '#WorkSmart', '#ProductivityChallenge']
    },

    // Learning & Education - More Inspiring
    {
        id: 'learning-challenge-1',
        title: 'Study Streak',
        template: '📖 STUDY STREAK! I\'m staking ₵{amount} to {title} for {timeframe}. This is my knowledge insurance! Who\'s ready to see me become a genius? 🧠 Let\'s learn together!',
        category: 'learning',
        difficulty: 'MEDIUM',
        emoji: '📖',
        description: 'Consistent study challenge',
        hashtags: ['#StudyStreak', '#Learning', '#Knowledge', '#StudyChallenge']
    },
    {
        id: 'learning-challenge-2',
        title: 'Language Learning',
        template: '🗣️ LANGUAGE CHALLENGE! I\'m betting ₵{amount} that I can {title} in {timeframe}. This is my fluency insurance! Who\'s ready to hear me speak like a native? 🌍',
        category: 'learning',
        difficulty: 'HARD',
        emoji: '🗣️',
        description: 'Language learning challenge',
        hashtags: ['#LanguageLearning', '#Fluency', '#Multilingual', '#LanguageChallenge']
    },
    {
        id: 'learning-challenge-3',
        title: 'Certification Goal',
        template: '🏆 CERTIFICATION BET! I\'m staking ₵{amount} to {title} by {deadline}. This is my expertise insurance! Who\'s ready to see me become certified? 📜 Let\'s get qualified!',
        category: 'learning',
        difficulty: 'HARD',
        emoji: '🏆',
        description: 'Professional certification challenge',
        hashtags: ['#Certification', '#ProfessionalDevelopment', '#Expertise', '#CertificationChallenge']
    },

    // Personal Development - More Motivational
    {
        id: 'personal-challenge-1',
        title: 'Habit Formation',
        template: '🌱 HABIT CHALLENGE! I\'m putting ₵{amount} on {title} for {timeframe}. This is my transformation insurance! Who\'s ready to see me become unstoppable? 💪 Let\'s build better habits!',
        category: 'personal',
        difficulty: 'MEDIUM',
        emoji: '🌱',
        description: 'Habit formation challenge',
        hashtags: ['#HabitFormation', '#PersonalGrowth', '#Transformation', '#HabitChallenge']
    },
    {
        id: 'personal-challenge-2',
        title: 'Mindfulness Practice',
        template: '🧘‍♀️ MINDFULNESS BET! I\'m staking ₵{amount} to {title} for {timeframe}. This is my peace insurance! Who\'s ready to see me become zen? 🌸 Let\'s find inner peace!',
        category: 'personal',
        difficulty: 'EASY',
        emoji: '🧘‍♀️',
        description: 'Mindfulness practice challenge',
        hashtags: ['#Mindfulness', '#InnerPeace', '#MentalHealth', '#MindfulnessChallenge']
    },
    {
        id: 'personal-challenge-3',
        title: 'Financial Goal',
        template: '💰 FINANCIAL CHALLENGE! I\'m betting ₵{amount} that I can {title} by {deadline}. This is my wealth insurance! Who\'s ready to see me become financially free? 🚀 Let\'s build wealth!',
        category: 'personal',
        difficulty: 'HARD',
        emoji: '💰',
        description: 'Financial goal challenge',
        hashtags: ['#FinancialGoals', '#WealthBuilding', '#FinancialFreedom', '#MoneyChallenge']
    },

    // Creative & Hobbies - More Artistic
    {
        id: 'creative-challenge-1',
        title: 'Creative Project',
        template: '🎨 CREATIVE CHALLENGE! I\'m staking ₵{amount} to {title} by {deadline}. This is my creativity insurance! Who\'s ready to see me create something amazing? ✨ Let\'s make art!',
        category: 'creative',
        difficulty: 'MEDIUM',
        emoji: '🎨',
        description: 'Creative project challenge',
        hashtags: ['#CreativeChallenge', '#Art', '#Creativity', '#CreativeProject']
    },
    {
        id: 'creative-challenge-2',
        title: 'Writing Challenge',
        template: '✍️ WRITING CHALLENGE! I\'m putting ₵{amount} on {title} for {timeframe}. This is my storytelling insurance! Who\'s ready to read my masterpiece? 📚 Let\'s write the future!',
        category: 'creative',
        difficulty: 'HARD',
        emoji: '✍️',
        description: 'Writing consistency challenge',
        hashtags: ['#WritingChallenge', '#Storytelling', '#Writing', '#CreativeWriting']
    },
    {
        id: 'creative-challenge-3',
        title: 'Music Practice',
        template: '🎵 MUSIC CHALLENGE! I\'m betting ₵{amount} that I can {title} for {timeframe}. This is my musical insurance! Who\'s ready to hear me play like a pro? 🎸 Let\'s make music!',
        category: 'creative',
        difficulty: 'MEDIUM',
        emoji: '🎵',
        description: 'Music practice challenge',
        hashtags: ['#MusicChallenge', '#MusicPractice', '#Musical', '#MusicLearning']
    },

    // Social & Community - More Engaging
    {
        id: 'social-challenge-1',
        title: 'Community Service',
        template: '🤝 COMMUNITY CHALLENGE! I\'m staking ₵{amount} to {title} by {deadline}. This is my impact insurance! Who\'s ready to see me make a difference? 🌟 Let\'s change the world!',
        category: 'social',
        difficulty: 'MEDIUM',
        emoji: '🤝',
        description: 'Community service challenge',
        hashtags: ['#CommunityService', '#Impact', '#SocialGood', '#CommunityChallenge']
    },
    {
        id: 'social-challenge-2',
        title: 'Networking Goal',
        template: '🌐 NETWORKING CHALLENGE! I\'m putting ₵{amount} on {title} for {timeframe}. This is my connection insurance! Who\'s ready to see me build an empire? 🚀 Let\'s connect!',
        category: 'social',
        difficulty: 'EASY',
        emoji: '🌐',
        description: 'Professional networking challenge',
        hashtags: ['#Networking', '#Connections', '#ProfessionalNetwork', '#NetworkingChallenge']
    },

    // Extreme Challenges - More Intense
    {
        id: 'extreme-challenge-1',
        title: 'Extreme Challenge',
        template: '🔥 EXTREME CHALLENGE! I\'m staking ₵{amount} to {title} by {deadline}. This is my ultimate test! Who\'s ready to see me push beyond limits? 💀 Let\'s go EXTREME!',
        category: 'extreme',
        difficulty: 'EXTREME',
        emoji: '🔥',
        description: 'Ultimate challenge',
        hashtags: ['#ExtremeChallenge', '#NoLimits', '#UltimateTest', '#ExtremeMode']
    },
    {
        id: 'extreme-challenge-2',
        title: 'Marathon Challenge',
        template: '🏃‍♂️ MARATHON CHALLENGE! I\'m betting ₵{amount} that I can {title} by {deadline}. This is my endurance insurance! Who\'s ready to see me go the distance? 🏁 Let\'s run!',
        category: 'extreme',
        difficulty: 'EXTREME',
        emoji: '🏃‍♂️',
        description: 'Marathon training challenge',
        hashtags: ['#MarathonChallenge', '#Endurance', '#Running', '#MarathonTraining']
    }
];

export class MessageTemplateService {
    static getTemplatesByCategory(category: string): MessageTemplate[] {
        return MESSAGE_TEMPLATES.filter(template =>
            template.category.toLowerCase() === category.toLowerCase()
        );
    }

    static getTemplatesByDifficulty(difficulty: string): MessageTemplate[] {
        return MESSAGE_TEMPLATES.filter(template =>
            template.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
    }

    static getTemplateById(id: string): MessageTemplate | undefined {
        return MESSAGE_TEMPLATES.find(template => template.id === id);
    }

    static generateMessage(template: MessageTemplate, data: any): string {
        let message = template.template;

        // Replace variables in the template
        message = message.replace(/{amount}/g, data.amount || '0');
        message = message.replace(/{title}/g, data.title || 'this challenge');
        message = message.replace(/{deadline}/g, data.deadline || 'the deadline');
        message = message.replace(/{timeframe}/g, data.timeframe || 'the timeframe');
        message = message.replace(/{goal}/g, data.goal || 'the goal');
        message = message.replace(/{project}/g, data.project || 'the project');
        message = message.replace(/{skill}/g, data.skill || 'the skill');
        message = message.replace(/{frequency}/g, data.frequency || 'daily');

        // Add hashtags
        if (template.hashtags && template.hashtags.length > 0) {
            message += '\n\n' + template.hashtags.join(' ');
        }

        return message;
    }

    static getRandomTemplate(category?: string): MessageTemplate {
        const templates = category ?
            this.getTemplatesByCategory(category) :
            MESSAGE_TEMPLATES;

        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }

    static getCategories(): string[] {
        return [...new Set(MESSAGE_TEMPLATES.map(template => template.category))];
    }

    static getDifficulties(): string[] {
        return [...new Set(MESSAGE_TEMPLATES.map(template => template.difficulty))];
    }
}
