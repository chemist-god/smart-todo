import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
    },
});

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
            console.log('HTML:', html);
            console.log('Text:', text);
            console.log('📧 END EMAIL\n');
            return { success: true, message: 'Email logged to console (development mode)' };
        }

        // In production, actually send the email
        const info = await transporter.sendMail({
            from: `"Smart Todo" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text,
        });

        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export function generateVerificationEmailHtml(token: string, type: 'email' | 'phone', identifier: string) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-request?token=${token}&type=${type.toUpperCase()}_VERIFICATION`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account - Smart Todo</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .code { background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Smart Todo</h1>
          <p>Verify Your Account</p>
        </div>
        <div class="content">
          <h2>Welcome to Smart Todo!</h2>
          <p>Thank you for signing up. To complete your account setup, please verify your ${type} address.</p>
          
          <p><strong>Verification Code:</strong></p>
          <div class="code">${token}</div>
          
          <p>Or click the button below to verify automatically:</p>
          <a href="${verificationUrl}" class="button">Verify Account</a>
          
          <p>This verification code will expire in 24 hours.</p>
          
          <p>If you didn't create an account with Smart Todo, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 Smart Todo. All rights reserved.</p>
          <p>This email was sent to ${identifier}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateVerificationEmailText(token: string, type: 'email' | 'phone', identifier: string) {
    return `
Smart Todo - Account Verification

Welcome to Smart Todo!

Thank you for signing up. To complete your account setup, please verify your ${type} address.

Verification Code: ${token}

This verification code will expire in 24 hours.

If you didn't create an account with Smart Todo, please ignore this email.

© 2024 Smart Todo. All rights reserved.
  `.trim();
}
