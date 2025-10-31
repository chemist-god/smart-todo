import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
        // In development, log the email instead of sending
        if (process.env.NODE_ENV === 'development') {
            console.log('\n📧 EMAIL WOULD BE SENT:');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('HTML:', html.substring(0, 500) + (html.length > 500 ? '...' : ''));
            console.log('Text:', text);
            console.log('📧 END EMAIL\n');
            return { success: true, message: 'Email logged to console (development mode)' };
        }

        // In production, actually send the email via Resend
        const data = await resend.emails.send({
            from: 'Smart Todo <onboarding@resend.dev>', // Use your verified domain later
            to: [to],
            subject: subject,
            html: html,
            text: text,
        });

        console.log('Email sent successfully via Resend:', data.data?.id);
        return { success: true, messageId: data.data?.id };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export function generateVerificationEmailHtml(token: string, type: 'email' | 'phone', identifier: string): string {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-request?token=${token}&type=${type.toUpperCase()}_VERIFICATION`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account - Smart Todo</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 50px 30px; text-align: center; border-radius: 16px 16px 0 0; box-shadow: 0 10px 40px rgba(79, 70, 229, 0.2);">
          <div style="font-size: 32px; font-weight: 700; margin-bottom: 8px;">🎯 Smart Todo</div>
          <div style="font-size: 18px; opacity: 0.9; font-weight: 500;">Verify Your Account</div>
        </div>

        <!-- Content -->
        <div style="background: #ffffff; padding: 50px 40px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          <h1 style="margin: 0 0 24px 0; color: #1e293b; font-size: 28px; font-weight: 700;">Welcome to Smart Todo! 🚀</h1>

          <p style="margin-bottom: 32px; font-size: 16px; color: #64748b;">Thank you for signing up! To complete your account setup and start boosting your productivity, please verify your ${type} address.</p>

          <!-- Verification Code -->
          <div style="margin-bottom: 32px;">
            <p style="margin: 0 0 12px 0; font-weight: 600; color: #374151; font-size: 16px;">Your Verification Code:</p>
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px 24px; border-radius: 12px; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace; font-size: 24px; font-weight: 700; text-align: center; letter-spacing: 3px; border: 2px solid #cbd5e1; color: #1e293b; word-break: break-all;">${token}</div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 32px;">
            <p style="margin: 0 0 20px 0; color: #64748b;">Or click the button below to verify automatically:</p>
            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 32px rgba(79, 70, 229, 0.3);">✅ Verify My Account</a>
          </div>

          <!-- Warning -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px;">⏰ <strong>Important:</strong> This verification code will expire in 24 hours.</p>
          </div>

          <p style="margin: 24px 0 0 0; color: #64748b; font-size: 14px;">If you didn't create an account with Smart Todo, please ignore this email.</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 32px; color: #94a3b8; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">© 2024 Smart Todo. All rights reserved.</p>
          <p style="margin: 0; font-size: 12px;">This email was sent to ${identifier}</p>
        </div>
      </div>
    </body>
    </html>
  `.trim();
}

export function generateVerificationEmailText(token: string, type: 'email' | 'phone', identifier: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-request?token=${token}&type=${type.toUpperCase()}_VERIFICATION`;

    return `
🎯 Smart Todo - Account Verification

Welcome to Smart Todo! 🚀

Thank you for signing up! To complete your account setup and start boosting your productivity, please verify your ${type} address.

Your Verification Code: ${token}

Or verify automatically: ${verificationUrl}

⏰ Important: This verification code will expire in 24 hours.

If you didn't create an account with Smart Todo, please ignore this email.

© 2024 Smart Todo. All rights reserved.
This email was sent to ${identifier}
  `.trim();
}
