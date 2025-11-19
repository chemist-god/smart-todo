import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";

// POST /api/wallet/test-deposit - Add test funds for development
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only allow in development environment or when test funds are explicitly enabled
        if (process.env.NODE_ENV === 'production' && 
            process.env.ENABLE_TEST_FUNDS !== 'true' && 
            process.env.NEXT_PUBLIC_ENABLE_TEST_FUNDS !== 'true') {
            return NextResponse.json({ error: "Demo funds not available. Please contact support or try again later." }, { status: 403 });
        }

        const { amount = 100 } = await request.json(); // Default ₵100 for testing

        // In production demo mode, add safeguards
        if (process.env.NODE_ENV === 'production') {
            // Check if user already received demo funds today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todayDeposits = await prisma.walletTransaction.count({
                where: {
                    userId: user.id,
                    type: "TEST_DEPOSIT",
                    createdAt: {
                        gte: today
                    }
                }
            });

            // Limit to 1 demo deposit per day in production
            if (todayDeposits >= 1) {
                return NextResponse.json({ 
                    error: "Demo funds can only be added once per day. Please try again tomorrow." 
                }, { status: 429 });
            }

            // Limit demo amount to ₵100 in production
            const maxDemoAmount = 100;
            if (amount > maxDemoAmount) {
                return NextResponse.json({ 
                    error: `Demo amount cannot exceed ₵${maxDemoAmount}` 
                }, { status: 400 });
            }
        }

        // Get or create user wallet
        let wallet = await prisma.userWallet.findUnique({
            where: { userId: user.id }
        });

        if (!wallet) {
            wallet = await prisma.userWallet.create({
                data: {
                    userId: user.id,
                    balance: 0,
                    totalEarned: 0,
                    totalLost: 0,
                    totalStaked: 0,
                    completionRate: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    rank: 0
                }
            });
        }

        // Add test funds
        const newBalance = Number(wallet.balance) + amount;
        const newTotalEarned = Number(wallet.totalEarned) + amount;

        const updatedWallet = await prisma.userWallet.update({
            where: { id: wallet.id },
            data: {
                balance: newBalance,
                totalEarned: newTotalEarned,
                updatedAt: new Date()
            }
        });

        // Create transaction record
        await prisma.walletTransaction.create({
            data: {
                walletId: wallet.id,
                userId: user.id,
                type: "TEST_DEPOSIT",
                amount: amount,
                description: process.env.NODE_ENV === 'production' ? `Demo deposit of ₵${amount}` : `Test deposit of ₵${amount} for development`,
                referenceId: `test-${Date.now()}`
            }
        });

        return NextResponse.json({
            success: true,
            message: `Test deposit of ₵${amount} successful`,
            wallet: {
                balance: newBalance,
                totalEarned: newTotalEarned,
                totalLost: Number(updatedWallet.totalLost),
                totalStaked: Number(updatedWallet.totalStaked)
            }
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json({ error: errorMessage }, { status: statusCode });
    }
}
