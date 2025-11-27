import { Resend } from 'resend';

/**
 * Enterprise Email Service
 * 
 * Professional email delivery service with Aurora-themed templates.
 * Features comprehensive error handling, retry logic, and enterprise-grade
 * email templates with glass morphism effects and responsive design.
 */

// Email configuration interface
export interface EmailConfig {
  from?: string;
  replyTo?: string;
  priority?: 'high' | 'normal' | 'low';
  trackOpens?: boolean;
  trackClicks?: boolean;
}

// Email delivery result interface
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryTime?: number;
  provider?: 'resend' | 'console';
}

// Email template variables interface
export interface EmailTemplateVars {
  userName?: string;
  token?: string;
  verificationUrl?: string;
  identifier?: string;
  type?: 'email' | 'phone';
  appName?: string;
  supportEmail?: string;
  companyName?: string;
}

// Legacy interface for backward compatibility
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  config?: EmailConfig;
}

// Enterprise email client with singleton pattern
class EmailService {
  private static instance: EmailService;
  private resendClient: Resend | null = null;
  private readonly config = {
    maxRetries: 3,
    retryDelay: 1000,
    defaultFrom: 'Smart Todo <auth@soulledger.app>',
    timeoutMs: 10000,
  };

  private constructor() {
    this.initializeClient();
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initializeClient(): void {
    if (process.env.NODE_ENV === 'production' && !this.resendClient) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is required in production');
      }
      this.resendClient = new Resend(apiKey);
    }
  }

  private getClient(): Resend {
    if (!this.resendClient) {
      throw new Error('Email client not initialized. Check environment configuration.');
    }
    return this.resendClient;
  }

  /**
   * Send email with enterprise-grade error handling and retry logic
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    config: EmailConfig = {}
  ): Promise<EmailResult> {
    const startTime = Date.now();
    
    try {
      // Development mode - log to console with structured format
      if (process.env.NODE_ENV === 'development') {
        return this.logEmailToConsole(to, subject, html, text);
      }

      // Production mode - send via Resend with retry logic
      return await this.sendWithRetry(to, subject, html, text, config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown email service error';
      console.error('Email service error:', { error: errorMessage, to, subject });
      
      return {
        success: false,
        error: errorMessage,
        deliveryTime: Date.now() - startTime,
        provider: 'resend',
      };
    }
  }

  private async sendWithRetry(
    to: string,
    subject: string,
    html: string,
    text: string | undefined,
    config: EmailConfig,
    attempt: number = 1
  ): Promise<EmailResult> {
    try {
      const client = this.getClient();
      const data = await client.emails.send({
        from: config.from || this.config.defaultFrom,
        to: [to],
        subject,
        html,
        text,
        replyTo: config.replyTo,
      });

      console.log('Email delivered successfully:', {
        messageId: data.data?.id,
        to,
        subject,
        attempt,
      });

      return {
        success: true,
        messageId: data.data?.id,
        deliveryTime: Date.now() - Date.now(),
        provider: 'resend',
      };
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        console.warn(`Email send failed, retrying (${attempt}/${this.config.maxRetries}):`, error);
        await this.delay(this.config.retryDelay * attempt);
        return this.sendWithRetry(to, subject, html, text, config, attempt + 1);
      }
      throw error;
    }
  }

  private logEmailToConsole(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): EmailResult {
    const separator = '='.repeat(80);
    console.log('\n' + separator);
    console.log('📧 EMAIL DELIVERY (Development Mode)');
    console.log(separator);
    console.log('📮 To:', to);
    console.log('📋 Subject:', subject);
    console.log('📄 HTML Preview:', html.substring(0, 500) + (html.length > 500 ? '...' : ''));
    if (text) {
      console.log('📝 Text:', text);
    }
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log(separator + '\n');

    return {
      success: true,
      messageId: 'dev-' + Date.now(),
      deliveryTime: 0,
      provider: 'console',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
const emailService = EmailService.getInstance();

// Legacy export for backward compatibility
export async function sendEmail(
  options: EmailOptions & { config?: EmailConfig }
): Promise<EmailResult> {
  return emailService.sendEmail(
    options.to,
    options.subject,
    options.html,
    options.text,
    options.config
  );
}

// Aurora-themed email template factory
class AuroraEmailTemplates {
  private static readonly auroraColors = {
    primary: '#4f46e5',
    primaryLight: '#818cf8',
    success: '#10b981',
    warning: '#f59e0b',
    destructive: '#ef4444',
    info: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
  };

  /**
   * Generate Aurora-themed verification email with glass morphism effects
   */
  static generateVerificationEmail(
    token: string,
    type: 'email' | 'phone',
    identifier: string,
    vars: EmailTemplateVars = {}
  ): { html: string; text: string } {
    const verificationUrl = 
      `${process.env.NEXTAUTH_URL || 'https://smarttodo.app'}/auth/verify-request?token=${token}&type=${type.toUpperCase()}_VERIFICATION`;
    
    const html = this.createAuroraVerificationHtml(token, type, identifier, verificationUrl, vars);
    const text = this.createVerificationText(token, type, identifier, verificationUrl, vars);
    
    return { html, text };
  }

  private static createAuroraVerificationHtml(
    token: string,
    type: 'email' | 'phone',
    identifier: string,
    verificationUrl: string,
    vars: EmailTemplateVars
  ): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Verify Your Account - Smart Todo</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      color: ${this.auroraColors.text};
      line-height: 1.6;
      min-height: 100vh;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 
        0 32px 64px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(148, 163, 184, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    
    .header {
      background: linear-gradient(135deg, ${this.auroraColors.primary} 0%, ${this.auroraColors.primaryLight} 100%);
      padding: 60px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: shimmer 3s ease-in-out infinite;
    }
    
    @keyframes shimmer {
      0%, 100% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
    }
    
    .logo {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      position: relative;
      z-index: 1;
    }
    
    .subtitle {
      font-size: 20px;
      font-weight: 600;
      opacity: 0.95;
      position: relative;
      z-index: 1;
    }
    
    .content {
      padding: 60px 40px;
    }
    
    .title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 24px;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .description {
      font-size: 18px;
      color: ${this.auroraColors.textMuted};
      margin-bottom: 40px;
      line-height: 1.7;
    }
    
    .verification-card {
      background: rgba(51, 65, 85, 0.6);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .code-label {
      font-size: 16px;
      font-weight: 600;
      color: ${this.auroraColors.text};
      margin-bottom: 16px;
    }
    
    .verification-code {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(129, 140, 248, 0.2) 100%);
      border: 2px solid ${this.auroraColors.primary};
      border-radius: 12px;
      padding: 24px 32px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 4px;
      color: #ffffff;
      text-shadow: 0 0 20px rgba(79, 70, 229, 0.5);
      margin-bottom: 24px;
      word-break: break-all;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${this.auroraColors.primary} 0%, ${this.auroraColors.primaryLight} 100%);
      color: white;
      padding: 18px 36px;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 18px;
      box-shadow: 
        0 8px 32px rgba(79, 70, 229, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      margin-top: 16px;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 12px 40px rgba(79, 70, 229, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    
    .warning-card {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
    }
    
    .warning-text {
      color: #fbbf24;
      font-weight: 600;
      font-size: 15px;
    }
    
    .footer {
      padding: 40px;
      text-align: center;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.4);
    }
    
    .footer-text {
      color: ${this.auroraColors.textMuted};
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .footer-small {
      font-size: 12px;
      opacity: 0.7;
    }
    
    .trust-indicators {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }
    
    .trust-item {
      text-align: center;
    }
    
    .trust-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .trust-text {
      font-size: 12px;
      color: ${this.auroraColors.textMuted};
    }
    
    @media (max-width: 600px) {
      body {
        padding: 12px;
      }
      
      .email-container {
        border-radius: 16px;
      }
      
      .header {
        padding: 40px 24px;
      }
      
      .content {
        padding: 40px 24px;
      }
      
      .title {
        font-size: 28px;
      }
      
      .verification-code {
        font-size: 24px;
        letter-spacing: 3px;
        padding: 20px 24px;
      }
      
      .cta-button {
        padding: 16px 28px;
        font-size: 16px;
      }
      
      .trust-indicators {
        gap: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Aurora Header -->
    <div class="header">
      <div class="logo">🎯 Smart Todo</div>
      <div class="subtitle">Verify Your Account</div>
    </div>

    <!-- Main Content -->
    <div class="content">
      <h1 class="title">Welcome to Smart Todo! 🚀</h1>
      
      <p class="description">
        Thank you for choosing Smart Todo! To complete your account setup and unlock your productivity potential, 
        please verify your ${type} address. We're excited to have you on board.
      </p>

      <!-- Verification Code Card -->
      <div class="verification-card">
        <div class="code-label">Your Verification Code</div>
        <div class="verification-code">${token}</div>
        <a href="${verificationUrl}" class="cta-button">✅ Verify My Account</a>
      </div>

      <!-- Security Warning -->
      <div class="warning-card">
        <div class="warning-text">
          ⏰ <strong>Important:</strong> This verification code expires in 24 hours for your security.
        </div>
      </div>

      <p class="description" style="margin-top: 32px; font-size: 16px;">
        If you didn't create an account with Smart Todo, please ignore this email or 
        <a href="mailto:support@soulledger.app" style="color: ${this.auroraColors.primary};">contact our support team</a>.
      </p>
    </div>

    <!-- Footer with Trust Indicators -->
    <div class="footer">
      <div class="footer-text">© 2024 Smart Todo. All rights reserved.</div>
      <div class="footer-text footer-small">This email was sent to ${identifier}</div>
      
      <div class="trust-indicators">
        <div class="trust-item">
          <div class="trust-icon">🔒</div>
          <div class="trust-text">Secure</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">⚡</div>
          <div class="trust-text">Fast</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">🛡️</div>
          <div class="trust-text">Reliable</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">🌟</div>
          <div class="trust-text">Premium</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`.trim();
  }

  private static createVerificationText(
    token: string,
    type: 'email' | 'phone',
    identifier: string,
    verificationUrl: string,
    vars: EmailTemplateVars
  ): string {
    return `
🎯 Smart Todo - Account Verification

Welcome to Smart Todo! 🚀

Thank you for choosing Smart Todo! To complete your account setup and unlock your productivity potential, please verify your ${type} address.

Your Verification Code: ${token}

Or verify automatically here: ${verificationUrl}

⏰ Important: This verification code expires in 24 hours for your security.

If you didn't create an account with Smart Todo, please ignore this email or contact our support team at support@soulledger.app.

---

© 2024 Smart Todo. All rights reserved.
This email was sent to ${identifier}

🔒 Secure • ⚡ Fast • 🛡️ Reliable • 🌟 Premium
  `.trim();
  }
}

// Legacy exports for backward compatibility
export function generateVerificationEmailHtml(
  token: string,
  type: 'email' | 'phone',
  identifier: string,
  vars: EmailTemplateVars = {}
): string {
  return AuroraEmailTemplates.generateVerificationEmail(token, type, identifier, vars).html;
}

export function generateVerificationEmailText(
  token: string,
  type: 'email' | 'phone',
  identifier: string,
  vars: EmailTemplateVars = {}
): string {
  return AuroraEmailTemplates.generateVerificationEmail(token, type, identifier, vars).text;
}

// Export the template factory for advanced usage
export { AuroraEmailTemplates, EmailService };
