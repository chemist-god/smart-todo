import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, ValidationError, NotFoundError } from "@/lib/error-handler";

// Zod schema for wallet operations
const depositSchema = z.object({
    amount: z.number().min(0.01, "Amount must be at least 0.01"),
    method: z.enum(["CARD", "BANK_TRANSFER", "MOBILE_MONEY"]),
    reference: z.string().optional(),
});

const withdrawSchema = z.object({
    amount: z.number().min(0.01, "Amount must be at least 0.01"),
    method: z.enum(["BANK_TRANSFER", "MOBILE_MONEY"]),
    accountDetails: z.string().min(1, "Account details are required"),
});

// GET /api/wallet - Get user wallet information
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create user wallet
        let wallet = await prisma.userWallet.findUnique({
            where: { userId: user.id },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        // Create wallet if it doesn't exist
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
                    rank: 0,
                },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });
        }

        // Calculate recent transaction summary
        const recentTransactions = wallet.transactions || [];
        const monthlyEarnings = recentTransactions
            .filter(t => t.type === 'REWARD' &&
                new Date(t.createdAt) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return NextResponse.json({
            balance: Number(wallet.balance),
            totalEarned: Number(wallet.totalEarned),
            totalLost: Number(wallet.totalLost),
            totalStaked: Number(wallet.totalStaked),
            completionRate: Number(wallet.completionRate),
            currentStreak: wallet.currentStreak,
            longestStreak: wallet.longestStreak,
            rank: wallet.rank,
            recentTransactions: recentTransactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: Number(t.amount),
                description: t.description,
                createdAt: t.createdAt,
                referenceId: t.referenceId
            })),
            monthlyEarnings: monthlyEarnings,
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// POST /api/wallet/deposit - Deposit money into wallet
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = depositSchema.parse(body);

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
                    rank: 0,
                }
            });
        }

        // Update wallet balance
        const newBalance = Number(wallet.balance) + validatedData.amount;

        const updatedWallet = await prisma.userWallet.update({
            where: { id: wallet.id },
            data: {
                balance: newBalance,
                updatedAt: new Date()
            }
        });

        // Create transaction record
        const transaction = await prisma.walletTransaction.create({
            data: {
                walletId: wallet.id,
                userId: user.id,
                type: 'DEPOSIT',
                amount: validatedData.amount,
                description: `Deposit via ${validatedData.method}`,
                referenceId: validatedData.reference
            }
        });

        return NextResponse.json({
            success: true,
            wallet: {
                balance: Number(updatedWallet.balance),
                totalEarned: Number(updatedWallet.totalEarned),
                totalLost: Number(updatedWallet.totalLost),
                totalStaked: Number(updatedWallet.totalStaked),
            },
            transaction: {
                id: transaction.id,
                type: transaction.type,
                amount: Number(transaction.amount),
                description: transaction.description,
                createdAt: transaction.createdAt,
                referenceId: transaction.referenceId
            }
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// PUT /api/wallet/withdraw - Withdraw money from wallet
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = withdrawSchema.parse(body);

        // Get user wallet
        const wallet = await prisma.userWallet.findUnique({
            where: { userId: user.id }
        });

        if (!wallet) {
            throw new NotFoundError("Wallet not found");
        }

        // Check if user has sufficient balance
        if (Number(wallet.balance) < validatedData.amount) {
            throw new ValidationError("Insufficient balance");
        }

        // Update wallet balance
        const newBalance = Number(wallet.balance) - validatedData.amount;

        const updatedWallet = await prisma.userWallet.update({
            where: { id: wallet.id },
            data: {
                balance: newBalance,
                updatedAt: new Date()
            }
        });

        // Create transaction record
        const transaction = await prisma.walletTransaction.create({
            data: {
                walletId: wallet.id,
                userId: user.id,
                type: 'WITHDRAWAL',
                amount: validatedData.amount,
                description: `Withdrawal via ${validatedData.method} to ${validatedData.accountDetails}`,
            }
        });

        return NextResponse.json({
            success: true,
            wallet: {
                balance: Number(updatedWallet.balance),
                totalEarned: Number(updatedWallet.totalEarned),
                totalLost: Number(updatedWallet.totalLost),
                totalStaked: Number(updatedWallet.totalStaked),
            },
            transaction: {
                id: transaction.id,
                type: transaction.type,
                amount: Number(transaction.amount),
                description: transaction.description,
                createdAt: transaction.createdAt,
                referenceId: transaction.referenceId
            }
        });

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error);
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
