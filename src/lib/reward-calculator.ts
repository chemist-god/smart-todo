import { StakeType, StakeStatus } from "@prisma/client";

export interface StakeData {
    id: string;
    stakeType: StakeType;
    status: StakeStatus;
    totalAmount: number;
    userStake: number;
    friendStakes: number;
    deadline: Date;
    completedAt?: Date;
}

export interface UserStreakData {
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
}

export interface RewardCalculation {
    baseReward: number;
    bonusAmount: number;
    totalReward: number;
    bonusType: string;
    description: string;
}

export class RewardCalculator {
    // Base bonus rates
    private static readonly BASE_SELF_REWARD_RATE = 0.25; // 25% base bonus
    private static readonly STREAK_BONUS_RATE = 0.05; // 5% per streak
    private static readonly MAX_STREAK_BONUS = 0.50; // Maximum 50% streak bonus
    private static readonly FRIEND_SUPPORTER_BONUS = 0.10; // 10% bonus for supporters

    /**
     * Calculate reward for self-stake completion
     */
    static calculateSelfStakeReward(
        stakeAmount: number,
        userStreak: UserStreakData
    ): RewardCalculation {
        const baseReward = stakeAmount;
        const streakBonus = this.calculateStreakBonus(userStreak.currentStreak);
        const totalBonusRate = this.BASE_SELF_REWARD_RATE + streakBonus;
        const bonusAmount = stakeAmount * totalBonusRate;
        const totalReward = baseReward + bonusAmount;

        return {
            baseReward,
            bonusAmount,
            totalReward,
            bonusType: 'SELF_REWARD',
            description: `Self-stake completion with ${(totalBonusRate * 100).toFixed(1)}% bonus`
        };
    }

    /**
     * Calculate reward for social-stake completion
     */
    static calculateSocialStakeReward(
        totalPool: number,
        userStake: number
    ): RewardCalculation {
        // Winner takes all in social stakes
        const baseReward = totalPool;
        const bonusAmount = 0; // No additional bonus for social stakes
        const totalReward = baseReward;

        return {
            baseReward,
            bonusAmount,
            totalReward,
            bonusType: 'POOL_REWARD',
            description: `Social stake completion - winner takes all`
        };
    }

    /**
     * Calculate reward for friend supporters
     */
    static calculateFriendReward(
        friendStake: number,
        isSupporter: boolean
    ): RewardCalculation {
        if (!isSupporter) {
            return {
                baseReward: 0,
                bonusAmount: 0,
                totalReward: 0,
                bonusType: 'FRIEND_REWARD',
                description: 'Non-supporter gets no reward'
            };
        }

        const baseReward = friendStake;
        const bonusAmount = friendStake * this.FRIEND_SUPPORTER_BONUS;
        const totalReward = baseReward + bonusAmount;

        return {
            baseReward,
            bonusAmount,
            totalReward,
            bonusType: 'FRIEND_REWARD',
            description: `Friend supporter reward with ${(this.FRIEND_SUPPORTER_BONUS * 100).toFixed(1)}% bonus`
        };
    }

    /**
     * Calculate penalty pool distribution
     */
    static calculatePenaltyPoolDistribution(
        penaltyPool: number,
        topPerformers: Array<{ userId: string; weight: number }>
    ): Array<{ userId: string; amount: number; reason: string }> {
        const totalWeight = topPerformers.reduce((sum, performer) => sum + performer.weight, 0);

        if (totalWeight === 0) {
            return [];
        }

        return topPerformers.map(performer => ({
            userId: performer.userId,
            amount: (penaltyPool * performer.weight) / totalWeight,
            reason: 'Top performer bonus from penalty pool'
        }));
    }

    /**
     * Calculate streak bonus percentage
     */
    private static calculateStreakBonus(currentStreak: number): number {
        if (currentStreak < 3) return 0;

        const streakBonus = Math.min(
            (currentStreak - 2) * this.STREAK_BONUS_RATE,
            this.MAX_STREAK_BONUS
        );

        return streakBonus;
    }

    /**
     * Calculate penalty amount for failed stake
     */
    static calculatePenaltyAmount(stakeAmount: number, stakeType: StakeType): number {
        switch (stakeType) {
            case 'SELF_STAKE':
                return stakeAmount; // Full amount goes to penalty pool
            case 'SOCIAL_STAKE':
                return stakeAmount; // User's stake goes to penalty pool
            case 'CHALLENGE_STAKE':
                return stakeAmount * 0.5; // 50% penalty for challenges
            case 'TEAM_STAKE':
                return stakeAmount * 0.75; // 75% penalty for team stakes
            case 'CHARITY_STAKE':
                return 0; // No penalty for charity stakes
            default:
                return stakeAmount;
        }
    }

    /**
     * Calculate time-based bonus for early completion
     */
    static calculateTimeBonus(
        stakeAmount: number,
        deadline: Date,
        completedAt: Date
    ): number {
        const timeRemaining = deadline.getTime() - completedAt.getTime();
        const totalTime = deadline.getTime() - new Date().getTime();

        if (timeRemaining <= 0) return 0; // No bonus if late

        const timeRatio = timeRemaining / totalTime;

        if (timeRatio >= 0.5) {
            return stakeAmount * 0.1; // 10% bonus for completing with 50%+ time remaining
        } else if (timeRatio >= 0.25) {
            return stakeAmount * 0.05; // 5% bonus for completing with 25%+ time remaining
        }

        return 0; // No bonus for last-minute completion
    }

    /**
     * Calculate achievement bonus
     */
    static calculateAchievementBonus(
        stakeAmount: number,
        achievementType: string
    ): number {
        const bonusRates: Record<string, number> = {
            'FIRST_STAKE': 0.2, // 20% bonus for first stake
            'HIGH_AMOUNT': 0.15, // 15% bonus for high amount stakes
            'LONG_STREAK': 0.25, // 25% bonus for long streak
            'PERFECT_MONTH': 0.3, // 30% bonus for perfect month
            'SOCIAL_LEADER': 0.2, // 20% bonus for social leader
        };

        const bonusRate = bonusRates[achievementType] || 0;
        return stakeAmount * bonusRate;
    }

    /**
     * Calculate total reward with all bonuses
     */
    static calculateTotalReward(
        stake: StakeData,
        userStreak: UserStreakData,
        options: {
            includeTimeBonus?: boolean;
            includeAchievementBonus?: boolean;
            achievementType?: string;
        } = {}
    ): RewardCalculation {
        let baseCalculation: RewardCalculation;

        // Calculate base reward based on stake type
        if (stake.stakeType === 'SELF_STAKE') {
            baseCalculation = this.calculateSelfStakeReward(stake.userStake, userStreak);
        } else if (stake.stakeType === 'SOCIAL_STAKE') {
            baseCalculation = this.calculateSocialStakeReward(stake.totalAmount, stake.userStake);
        } else {
            // Default to self-stake calculation for other types
            baseCalculation = this.calculateSelfStakeReward(stake.userStake, userStreak);
        }

        let totalReward = baseCalculation.totalReward;
        let additionalBonuses: string[] = [];

        // Add time bonus if applicable
        if (options.includeTimeBonus && stake.completedAt) {
            const timeBonus = this.calculateTimeBonus(
                stake.userStake,
                stake.deadline,
                stake.completedAt
            );
            totalReward += timeBonus;
            if (timeBonus > 0) {
                additionalBonuses.push(`Time bonus: ${timeBonus.toFixed(2)} GHS`);
            }
        }

        // Add achievement bonus if applicable
        if (options.includeAchievementBonus && options.achievementType) {
            const achievementBonus = this.calculateAchievementBonus(
                stake.userStake,
                options.achievementType
            );
            totalReward += achievementBonus;
            if (achievementBonus > 0) {
                additionalBonuses.push(`Achievement bonus: ${achievementBonus.toFixed(2)} GHS`);
            }
        }

        return {
            baseReward: baseCalculation.baseReward,
            bonusAmount: baseCalculation.bonusAmount + (totalReward - baseCalculation.totalReward),
            totalReward,
            bonusType: baseCalculation.bonusType,
            description: `${baseCalculation.description}${additionalBonuses.length > 0 ? ` + ${additionalBonuses.join(', ')}` : ''}`
        };
    }

    /**
     * Validate stake completion
     */
    static validateStakeCompletion(stake: StakeData, proof: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        // Check if stake is active
        if (stake.status !== 'ACTIVE') {
            errors.push('Stake is not active');
        }

        // Check if deadline has passed
        const now = new Date();
        if (now > stake.deadline) {
            errors.push('Stake deadline has passed');
        }

        // Check proof requirements
        if (!proof || proof.trim().length < 10) {
            errors.push('Proof of completion is required (minimum 10 characters)');
        }

        // Check if stake has already been completed
        if (stake.status === 'COMPLETED') {
            errors.push('Stake has already been completed');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
