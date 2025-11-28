import { Resend } from 'resend';
import {
  generateVerificationEmailHtml as generateVerificationHtml,
  generateVerificationEmailText as generateVerificationText,
  generateVerificationUrl,
  type VerificationEmailData,
} from './email-templates/verification-email';

/**
 * Professional Email Service for SoulLedger
 * 
 * Clean, maintainable email delivery service with proper error handling,
 * retry logic, and professional email templates.
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

// Legacy interface for backward compatibility
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  config?: EmailConfig;
}

// Email service configuration
const EMAIL_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  defaultFrom: 'SoulLedger <auth@soulledger.app>',
  defaultReplyTo: 'SoulLedger Support <support@soulledger.app>',
  timeoutMs: 10000,
} as const;

/**
 * Enterprise email client with singleton pattern
 */
class EmailService {
  private static instance: EmailService;
  private resendClient: Resend | null = null;

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
      // Development mode - log to console
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
        from: config.from || EMAIL_CONFIG.defaultFrom,
        to: [to],
        subject,
        html,
        text,
        replyTo: config.replyTo || EMAIL_CONFIG.defaultReplyTo,
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
      if (attempt < EMAIL_CONFIG.maxRetries) {
        console.warn(`Email send failed, retrying (${attempt}/${EMAIL_CONFIG.maxRetries}):`, error);
        await this.delay(EMAIL_CONFIG.retryDelay * attempt);
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
    console.log('EMAIL DELIVERY (Development Mode)');
    console.log(separator);
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML Preview:', html.substring(0, 300) + (html.length > 300 ? '...' : ''));
    if (text) {
      console.log('Text:', text);
    }
    console.log('Timestamp:', new Date().toISOString());
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

/**
 * Legacy export for backward compatibility
 */
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

/**
 * Generate verification email HTML
 * Legacy export for backward compatibility
 */
export function generateVerificationEmailHtml(
  token: string,
  type: 'email' | 'phone',
  identifier: string
): string {
  const verificationUrl = generateVerificationUrl(token, type);
  const data: VerificationEmailData = {
    token,
    type,
    identifier,
    verificationUrl,
  };
  return generateVerificationHtml(data);
}

/**
 * Generate verification email text
 * Legacy export for backward compatibility
 */
export function generateVerificationEmailText(
  token: string,
  type: 'email' | 'phone',
  identifier: string
): string {
  const verificationUrl = generateVerificationUrl(token, type);
  const data: VerificationEmailData = {
    token,
    type,
    identifier,
    verificationUrl,
  };
  return generateVerificationText(data);
}

// Export the email service for advanced usage
export { EmailService };
