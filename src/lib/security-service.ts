import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export interface SecurityConfig {
    maxStakeAmount: number;
    minStakeAmount: number;
    maxDailyStakes: number;
    maxMonthlyStakes: number;
    maxStakeValuePerDay: number;
    maxStakeValuePerMonth: number;
    suspiciousActivityThreshold: number;
    rateLimitWindow: number; // minutes
    rateLimitMaxRequests: number;
}

export interface SecurityCheck {
    isValid: boolean;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    violations: string[];
    recommendations: string[];
}

export interface FraudDetection {
    isFraudulent: boolean;
    riskScore: number; // 0-100
    indicators: string[];
    action: 'ALLOW' | 'REVIEW' | 'BLOCK';
}

export class SecurityService {
    private static readonly CONFIG: SecurityConfig = {
        maxStakeAmount: 10000, // $10,000
        minStakeAmount: 5, // $5
        maxDailyStakes: 10,
        maxMonthlyStakes: 100,
        maxStakeValuePerDay: 50000, // $50,000
        maxStakeValuePerMonth: 500000, // $500,000
        suspiciousActivityThreshold: 70,
        rateLimitWindow: 15, // 15 minutes
        rateLimitMaxRequests: 10
    };

    /**
     * Comprehensive security check before creating stake
     */
    static async validateStakeCreation(
        userId: string,
        amount: number,
        stakeType: string,
        ipAddress: string,
        userAgent: string
    ): Promise<SecurityCheck> {
        const violations: string[] = [];
        const recommendations: string[] = [];
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

        // 1. Amount validation
        if (amount < this.CONFIG.minStakeAmount) {
            violations.push(`Amount below minimum ($${this.CONFIG.minStakeAmount})`);
            riskLevel = 'HIGH';
        }

        if (amount > this.CONFIG.maxStakeAmount) {
            violations.push(`Amount exceeds maximum ($${this.CONFIG.maxStakeAmount})`);
            riskLevel = 'CRITICAL';
        }

        // 2. Rate limiting
        const rateLimitCheck = await this.checkRateLimit(userId, ipAddress);
        if (!rateLimitCheck.allowed) {
            violations.push('Rate limit exceeded');
            riskLevel = 'HIGH';
        }

        // 3. Daily/Monthly limits
        const limitCheck = await this.checkStakeLimits(userId, amount);
        if (!limitCheck.dailyAllowed) {
            violations.push('Daily stake limit exceeded');
            riskLevel = 'HIGH';
        }

        if (!limitCheck.monthlyAllowed) {
            violations.push('Monthly stake limit exceeded');
            riskLevel = 'CRITICAL';
        }

        // 4. Fraud detection
        const fraudCheck = await this.detectFraud(userId, amount, ipAddress, userAgent);
        if (fraudCheck.action === 'BLOCK') {
            violations.push('Fraud detected - transaction blocked');
            riskLevel = 'CRITICAL';
        } else if (fraudCheck.action === 'REVIEW') {
            violations.push('Suspicious activity detected - manual review required');
            riskLevel = 'HIGH';
        }

        // 5. Account verification
        const accountCheck = await this.checkAccountVerification(userId);
        if (!accountCheck.isVerified) {
            violations.push('Account not fully verified');
            riskLevel = 'MEDIUM';
            recommendations.push('Complete account verification to increase limits');
        }

        // 6. Geographic restrictions
        const geoCheck = await this.checkGeographicRestrictions(ipAddress);
        if (!geoCheck.allowed) {
            violations.push('Transactions not allowed from this location');
            riskLevel = 'CRITICAL';
        }

        // 7. Payment method validation
        const paymentCheck = await this.validatePaymentMethod(userId);
        if (!paymentCheck.isValid) {
            violations.push('Invalid or expired payment method');
            riskLevel = 'HIGH';
        }

        // 8. Suspicious patterns
        const patternCheck = await this.checkSuspiciousPatterns(userId, amount);
        if (patternCheck.isSuspicious) {
            violations.push('Suspicious transaction pattern detected');
            riskLevel = 'HIGH';
        }

        return {
            isValid: violations.length === 0,
            riskLevel,
            violations,
            recommendations
        };
    }

    /**
     * Check rate limiting
     */
    private static async checkRateLimit(userId: string, ipAddress: string): Promise<{
        allowed: boolean;
        remainingRequests: number;
    }> {
        const windowStart = new Date(Date.now() - this.CONFIG.rateLimitWindow * 60 * 1000);

        const userRequests = await prisma.escrowTransaction.count({
            where: {
                userId,
                createdAt: { gte: windowStart }
            }
        });

        const maxRequests = userRequests;
        return {
            allowed: maxRequests < this.CONFIG.rateLimitMaxRequests,
            remainingRequests: Math.max(0, this.CONFIG.rateLimitMaxRequests - maxRequests)
        };
    }

    /**
     * Check daily and monthly stake limits
     */
    private static async checkStakeLimits(userId: string, amount: number): Promise<{
        dailyAllowed: boolean;
        monthlyAllowed: boolean;
        dailyAmount: number;
        monthlyAmount: number;
    }> {
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [dailyStakes, monthlyStakes] = await Promise.all([
            prisma.escrowTransaction.findMany({
                where: {
                    userId,
                    createdAt: { gte: dayStart },
                    status: { in: ['PENDING', 'LOCKED', 'RELEASED'] }
                },
                select: { amount: true }
            }),
            prisma.escrowTransaction.findMany({
                where: {
                    userId,
                    createdAt: { gte: monthStart },
                    status: { in: ['PENDING', 'LOCKED', 'RELEASED'] }
                },
                select: { amount: true }
            })
        ]);

        const dailyAmount = dailyStakes.reduce((sum, stake) => sum + Number(stake.amount), 0);
        const monthlyAmount = monthlyStakes.reduce((sum, stake) => sum + Number(stake.amount), 0);

        return {
            dailyAllowed: dailyStakes.length < this.CONFIG.maxDailyStakes &&
                (dailyAmount + amount) <= this.CONFIG.maxStakeValuePerDay,
            monthlyAllowed: monthlyStakes.length < this.CONFIG.maxMonthlyStakes &&
                (monthlyAmount + amount) <= this.CONFIG.maxStakeValuePerMonth,
            dailyAmount,
            monthlyAmount
        };
    }

    /**
     * Detect fraudulent activity
     */
    private static async detectFraud(
        userId: string,
        amount: number,
        ipAddress: string,
        userAgent: string
    ): Promise<FraudDetection> {
        const indicators: string[] = [];
        let riskScore = 0;

        // 1. IP-based checks removed - User model doesn't have ipAddress field
        // TODO: Implement IP tracking if needed

        // 2. Check for rapid successive transactions
        const recentTransactions = await prisma.escrowTransaction.count({
            where: {
                userId,
                createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
            }
        });
        if (recentTransactions > 2) {
            indicators.push('Rapid successive transactions');
            riskScore += 15;
        }

        // 3. Check for unusual amounts
        const userHistory = await prisma.escrowTransaction.findMany({
            where: { userId },
            select: { amount: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        if (userHistory.length > 0) {
            const avgAmount = userHistory.reduce((sum, t) => sum + Number(t.amount), 0) / userHistory.length;
            if (amount > avgAmount * 5) {
                indicators.push('Amount significantly higher than usual');
                riskScore += 25;
            }
        }

        // 4. Check for suspicious user agent
        if (this.isSuspiciousUserAgent(userAgent)) {
            indicators.push('Suspicious user agent');
            riskScore += 10;
        }

        // 5. Check for VPN/Proxy usage
        if (await this.isVPNOrProxy(ipAddress)) {
            indicators.push('VPN/Proxy detected');
            riskScore += 15;
        }

        // 6. Check for known fraud patterns
        const fraudPatterns = await this.checkFraudPatterns(userId, ipAddress);
        if (fraudPatterns.length > 0) {
            indicators.push(...fraudPatterns);
            riskScore += fraudPatterns.length * 10;
        }

        let action: 'ALLOW' | 'REVIEW' | 'BLOCK' = 'ALLOW';
        if (riskScore >= 80) {
            action = 'BLOCK';
        } else if (riskScore >= 50) {
            action = 'REVIEW';
        }

        return {
            isFraudulent: riskScore >= 70,
            riskScore,
            indicators,
            action
        };
    }

    /**
     * Check account verification status
     */
    private static async checkAccountVerification(userId: string): Promise<{
        isVerified: boolean;
        verificationLevel: 'NONE' | 'BASIC' | 'FULL';
        missingRequirements: string[];
    }> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                emailVerified: true,
                name: true,
                image: true
            }
        });

        if (!user) {
            return {
                isVerified: false,
                verificationLevel: 'NONE',
                missingRequirements: ['Account not found']
            };
        }

        const missingRequirements: string[] = [];
        let verificationLevel: 'NONE' | 'BASIC' | 'FULL' = 'NONE';

        if (!user.email) missingRequirements.push('Email address');
        if (!user.emailVerified) missingRequirements.push('Email verification');
        if (!user.name) missingRequirements.push('Full name');

        if (missingRequirements.length === 0) {
            verificationLevel = 'FULL';
        } else if (missingRequirements.length <= 2) {
            verificationLevel = 'BASIC';
        }

        return {
            isVerified: verificationLevel === 'FULL',
            verificationLevel,
            missingRequirements
        };
    }

    /**
     * Check geographic restrictions
     */
    private static async checkGeographicRestrictions(ipAddress: string): Promise<{
        allowed: boolean;
        country: string;
        region: string;
    }> {
        // This would integrate with a geolocation service
        // For now, returning mock data
        const mockLocation = {
            country: 'US',
            region: 'CA'
        };

        // List of restricted countries/regions
        const restrictedCountries = ['CU', 'IR', 'KP', 'SY'];
        const restrictedRegions = ['RU-CR', 'RU-KDA']; // Crimea, Donbas

        const isRestricted = restrictedCountries.includes(mockLocation.country) ||
            restrictedRegions.includes(`${mockLocation.country}-${mockLocation.region}`);

        return {
            allowed: !isRestricted,
            country: mockLocation.country,
            region: mockLocation.region
        };
    }

    /**
     * Validate payment method
     */
    private static async validatePaymentMethod(userId: string): Promise<{
        isValid: boolean;
        paymentMethods: any[];
    }> {
        const paymentMethods = await prisma.paymentMethod.findMany({
            where: {
                userId,
                isVerified: true
            }
        });

        return {
            isValid: paymentMethods.length > 0,
            paymentMethods
        };
    }

    /**
     * Check for suspicious patterns
     */
    private static async checkSuspiciousPatterns(userId: string, amount: number): Promise<{
        isSuspicious: boolean;
        patterns: string[];
    }> {
        const patterns: string[] = [];

        // Check for round number amounts (common in fraud)
        if (amount % 100 === 0 && amount > 1000) {
            patterns.push('Round number amount');
        }

        // Check for amounts just under limits
        if (amount > this.CONFIG.maxStakeAmount * 0.95) {
            patterns.push('Amount just under maximum limit');
        }

        // Check for rapid amount increases
        const recentAmounts = await prisma.escrowTransaction.findMany({
            where: { userId },
            select: { amount: true },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        if (recentAmounts.length >= 3) {
            const amounts = recentAmounts.map(t => Number(t.amount));
            const isIncreasing = amounts.every((amount, i) => i === 0 || amount > amounts[i - 1]);
            if (isIncreasing) {
                patterns.push('Rapidly increasing amounts');
            }
        }

        return {
            isSuspicious: patterns.length > 0,
            patterns
        };
    }

    /**
     * Check if user agent is suspicious
     */
    private static isSuspiciousUserAgent(userAgent: string): boolean {
        const suspiciousPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i,
            /curl/i,
            /wget/i,
            /python/i,
            /java/i,
            /php/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(userAgent));
    }

    /**
     * Check if IP is VPN/Proxy
     */
    private static async isVPNOrProxy(ipAddress: string): Promise<boolean> {
        // This would integrate with a VPN/Proxy detection service
        // For now, returning false
        return false;
    }

    /**
     * Check for known fraud patterns
     */
    private static async checkFraudPatterns(userId: string, ipAddress: string): Promise<string[]> {
        const patterns: string[] = [];

        // Check for multiple failed transactions
        const failedTransactions = await prisma.escrowTransaction.count({
            where: {
                userId,
                status: 'FAILED'
            }
        });

        if (failedTransactions > 3) {
            patterns.push('Multiple failed transactions');
        }

        // Check for chargeback history
        const chargebacks = await prisma.escrowTransaction.count({
            where: {
                userId,
                failureReason: { contains: 'chargeback' }
            }
        });

        if (chargebacks > 0) {
            patterns.push('Previous chargebacks');
        }

        return patterns;
    }

    /**
     * Generate secure transaction ID
     */
    static generateSecureTransactionId(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Hash sensitive data
     */
    static hashSensitiveData(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Validate transaction signature
     */
    static validateTransactionSignature(
        data: string,
        signature: string,
        secret: string
    ): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(data)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    }

    /**
     * Generate transaction signature
     */
    static generateTransactionSignature(data: string, secret: string): string {
        return crypto
            .createHmac('sha256', secret)
            .update(data)
            .digest('hex');
    }
}
