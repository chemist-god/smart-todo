import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { sendEmail, generateVerificationEmailHtml, generateVerificationEmailText } from "@/lib/email-service";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { name, email, phone, password } = await request.json();

        // Validate required fields
        if (!email && !phone) {
            return NextResponse.json(
                { error: "Email or phone number is required" },
                { status: 400 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: "Password is required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email || undefined },
                    { phone: phone || undefined },
                ],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email or phone already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                password: hashedPassword,
            },
        });

        // Generate verification token
        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: {
                identifier: email || phone!,
                token,
                type: email ? "EMAIL_VERIFICATION" : "PHONE_VERIFICATION",
                expires,
                userId: user.id,
            },
        });

        // Send verification email/SMS
        const identifier = email || phone!;
        const type = email ? 'email' : 'phone';

        console.log(`📧 Sending verification ${type} to: ${identifier}`);
        console.log(`🔑 Verification token: ${token}`);

        // Send email for email verification
        if (email) {
            const emailResult = await sendEmail({
                to: email,
                subject: "Verify Your Smart Todo Account",
                html: generateVerificationEmailHtml(token, 'email', email),
                text: generateVerificationEmailText(token, 'email', email),
            });

            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
            }
        }

        // TODO: Implement SMS sending for phone verification
        if (phone) {
            console.log(`📱 SMS would be sent to: ${phone}`);
            console.log(`📱 SMS content: Your Smart Todo verification code is: ${token}`);
        }

        return NextResponse.json({
            message: "User created successfully. Please check your email/phone for verification.",
            userId: user.id,
            verificationRequired: true,
            emailSent: !!email,
            smsSent: !!phone,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
