import React from 'react';

interface EmailTemplateProps {
  token: string;
  type: 'email' | 'phone';
  identifier: string;
  verificationUrl: string;
}

export function VerificationEmailTemplate({
  token,
  type,
  identifier,
  verificationUrl
}: EmailTemplateProps) {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      lineHeight: '1.6',
      color: '#374151',
      margin: '0',
      padding: '0',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          padding: '50px 30px',
          textAlign: 'center',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 10px 40px rgba(79, 70, 229, 0.2)'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px'
          }}>
            🎯 Smart Todo
          </div>
          <div style={{
            fontSize: '18px',
            opacity: '0.9',
            fontWeight: '500'
          }}>
            Verify Your Account
          </div>
        </div>

        {/* Content */}
        <div style={{
          background: '#ffffff',
          padding: '50px 40px',
          borderRadius: '0 0 16px 16px',
          border: '1px solid #e2e8f0',
          borderTop: 'none',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)'
        }}>
          <h1 style={{
            margin: '0 0 24px 0',
            color: '#1e293b',
            fontSize: '28px',
            fontWeight: '700'
          }}>
            Welcome to Smart Todo! 🚀
          </h1>

          <p style={{
            marginBottom: '32px',
            fontSize: '16px',
            color: '#64748b'
          }}>
            Thank you for signing up! To complete your account setup and start boosting your productivity,
            please verify your {type} address.
          </p>

          {/* Verification Code */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{
              margin: '0 0 12px 0',
              fontWeight: '600',
              color: '#374151',
              fontSize: '16px'
            }}>
              Your Verification Code:
            </p>
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '20px 24px',
              borderRadius: '12px',
              fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
              fontSize: '24px',
              fontWeight: '700',
              textAlign: 'center',
              letterSpacing: '3px',
              border: '2px solid #cbd5e1',
              color: '#1e293b',
              wordBreak: 'break-all'
            }}>
              {token}
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <p style={{
              margin: '0 0 20px 0',
              color: '#64748b'
            }}>
              Or click the button below to verify automatically:
            </p>
            <a
              href={verificationUrl}
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white',
                padding: '16px 32px',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 8px 32px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              ✅ Verify My Account
            </a>
          </div>

          {/* Warning */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <p style={{
              margin: '0',
              color: '#92400e',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              ⏰ <strong>Important:</strong> This verification code will expire in 24 hours.
            </p>
          </div>

          <p style={{
            margin: '24px 0 0 0',
            color: '#64748b',
            fontSize: '14px'
          }}>
            If you didn't create an account with Smart Todo, please ignore this email.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            © 2024 Smart Todo. All rights reserved.
          </p>
          <p style={{ margin: '0', fontSize: '12px' }}>
            This email was sent to {identifier}
          </p>
        </div>
      </div>
    </div>
  );
}

export function generateVerificationEmailHtml(token: string, type: 'email' | 'phone', identifier: string): string {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-request?token=${token}&type=${type.toUpperCase()}_VERIFICATION`;

  // For now, return a simpler HTML version since we can't use React components directly
  // In a real app, you'd use a library like react-email or handlebars
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
