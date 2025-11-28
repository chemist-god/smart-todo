/**
 * Professional Email Templates for SoulLedger
 * Clean, modern, and responsive email templates
 */

export interface VerificationEmailData {
    token: string;
    type: 'email' | 'phone';
    identifier: string;
    verificationUrl: string;
}

/**
 * Get the base URL for the application
 * Handles different deployment scenarios (local, staging, production)
 */
export function getBaseUrl(): string {
    // Priority: NEXTAUTH_URL > VERCEL_URL > NEXT_PUBLIC_APP_URL > production fallback > local
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    }

    // Vercel deployment URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Public app URL (client-side accessible)
    if (process.env.NEXT_PUBLIC_APP_URL) {
        const url = new URL(process.env.NEXT_PUBLIC_APP_URL);
        return `${url.protocol}//${url.host}`;
    }

    // Production fallback
    if (process.env.NODE_ENV === 'production') {
        return 'https://soulledger.app';
    }

    // Development fallback
    return 'http://localhost:3000';
}

/**
 * Generate verification URL with proper domain handling
 */
export function generateVerificationUrl(token: string, type: 'email' | 'phone'): string {
    const baseUrl = getBaseUrl();
    const typeParam = type === 'email' ? 'EMAIL_VERIFICATION' : 'PHONE_VERIFICATION';
    return `${baseUrl}/auth/verify-request?token=${token}&type=${typeParam}`;
}

/**
 * Clean, professional verification email HTML template
 */
export function generateVerificationEmailHtml(data: VerificationEmailData): string {
    const { token, type, identifier, verificationUrl } = data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Verify Your Account - SoulLedger</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 20px;
    }
    
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    
    .header-text {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.95);
      font-weight: 500;
    }
    
    .content {
      padding: 48px 40px;
    }
    
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    
    .description {
      font-size: 16px;
      color: #4b5563;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    
    .verification-box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 32px;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .code-label {
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .verification-code {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
      font-size: 32px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: 2px;
      margin-bottom: 24px;
      word-break: break-all;
      padding: 16px;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin-top: 8px;
    }
    
    .info-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin-bottom: 32px;
      border-radius: 4px;
    }
    
    .info-text {
      font-size: 14px;
      color: #92400e;
      line-height: 1.5;
    }
    
    .footer {
      padding: 32px 40px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .footer-text {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .footer-link {
      color: #6366f1;
      text-decoration: none;
    }
    
    .footer-link:hover {
      text-decoration: underline;
    }
    
    @media (max-width: 600px) {
      body {
        padding: 12px;
      }
      
      .content {
        padding: 32px 24px;
      }
      
      .verification-box {
        padding: 24px;
      }
      
      .verification-code {
        font-size: 24px;
        letter-spacing: 1px;
      }
      
      .footer {
        padding: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">SoulLedger</div>
      <div class="header-text">Account Verification</div>
    </div>
    
    <div class="content">
      <h1 class="title">Welcome to SoulLedger</h1>
      
      <p class="description">
        Thank you for signing up! To complete your account setup, please verify your ${type === 'email' ? 'email address' : 'phone number'}.
      </p>
      
      <div class="verification-box">
        <div class="code-label">Your Verification Code</div>
        <div class="verification-code">${token}</div>
        <a href="${verificationUrl}" class="cta-button">Verify Account</a>
      </div>
      
      <div class="info-box">
        <p class="info-text">
          <strong>Important:</strong> This verification code expires in 24 hours. If you didn't create an account with SoulLedger, please ignore this email or contact our support team.
        </p>
      </div>
      
      <p class="description" style="font-size: 14px; margin-bottom: 0;">
        Need help? Contact us at <a href="mailto:support@soulledger.app" style="color: #6366f1; text-decoration: none;">support@soulledger.app</a>
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} SoulLedger. All rights reserved.</p>
      <p class="footer-text">This email was sent to ${identifier}</p>
      <p class="footer-text" style="margin-top: 16px;">
        <a href="https://soulledger.app" class="footer-link">Visit our website</a> | 
        <a href="mailto:support@soulledger.app" class="footer-link">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>
`.trim();
}

/**
 * Clean, professional verification email text template
 */
export function generateVerificationEmailText(data: VerificationEmailData): string {
    const { token, type, identifier, verificationUrl } = data;

    return `
SoulLedger - Account Verification

Welcome to SoulLedger!

Thank you for signing up! To complete your account setup, please verify your ${type === 'email' ? 'email address' : 'phone number'}.

Your Verification Code: ${token}

Verify your account: ${verificationUrl}

Important: This verification code expires in 24 hours.

If you didn't create an account with SoulLedger, please ignore this email or contact our support team at support@soulledger.app.

---

© ${new Date().getFullYear()} SoulLedger. All rights reserved.
This email was sent to ${identifier}

Visit us at https://soulledger.app
Support: support@soulledger.app
`.trim();
}

