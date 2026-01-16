import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateUsername, sanitizeUsername } from "@/lib/username-validation";

/**
 * POST /api/username/set
 * Set username for authenticated user
 * Username is profile data - accessible to all authenticated users (verified or not)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const user = session?.user;

        if (!user || !user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Please sign in to set your username.' },
                { status: 401 }
            );
        }

        const { username } = await request.json();

        if (!username || typeof username !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Username is required' },
                { status: 400 }
            );
        }

        // Validate format
        const validation = validateUsername(username);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        // Sanitize username
        const sanitized = sanitizeUsername(username);

        // Check if user already has a username
        const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { username: true },
        });

        // Check if username is already taken by another user (we store in lowercase)
        const existingUser = await prisma.user.findFirst({
            where: {
                username: sanitized,
                NOT: {
                    id: user.id, // Exclude current user
                },
            },
            select: {
                id: true,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'This username is already taken' },
                { status: 400 }
            );
        }

        // Update user's username
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { username: sanitized },
            select: { username: true },
        });

        return NextResponse.json({
            success: true,
            username: updatedUser.username,
            message: currentUser?.username
                ? 'Username updated successfully'
                : 'Username set successfully',
        });
    } catch (error: any) {
        console.error('Error setting username:', error);

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'This username is already taken' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'An error occurred while setting username' },
            { status: 500 }
        );
    }
}

