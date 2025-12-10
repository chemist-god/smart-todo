import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateUsername, sanitizeUsername } from "@/lib/username-validation";

/**
 * POST /api/username/check
 * Check if a username is available
 */
export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json();

        if (!username || typeof username !== 'string') {
            return NextResponse.json(
                { available: false, message: 'Username is required' },
                { status: 400 }
            );
        }

        // Validate format first
        const validation = validateUsername(username);
        if (!validation.valid) {
            return NextResponse.json(
                { available: false, message: validation.error },
                { status: 200 } // 200 because it's a validation response, not an error
            );
        }

        // Sanitize to lowercase for consistent storage and comparison
        const sanitized = sanitizeUsername(username);

        // Check if username exists (we store in lowercase, so direct comparison works)
        const existingUser = await prisma.user.findFirst({
            where: {
                username: sanitized,
            },
            select: {
                id: true,
            },
        });

        if (existingUser) {
            return NextResponse.json({
                available: false,
                message: 'This username is already taken',
            });
        }

        return NextResponse.json({
            available: true,
            message: 'Username is available',
        });
    } catch (error) {
        console.error('Error checking username availability:', error);
        return NextResponse.json(
            { available: false, message: 'An error occurred while checking availability' },
            { status: 500 }
        );
    }
}

