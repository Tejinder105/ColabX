import nodemailer from 'nodemailer';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Create transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendInvitationEmailInput {
  to: string;
  orgName: string;
  invitedBy: string;
  token: string;
  role: 'admin' | 'manager' | 'partner';
}

export async function sendInvitationEmail({
  to,
  orgName,
  invitedBy,
  token,
  role,
}: SendInvitationEmailInput): Promise<void> {
  const inviteLink = `${APP_URL}/auth?invite=${token}`;
  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    partner: 'Partner',
  };

  const subject = `You're invited to ${orgName} on ColabX`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .role-badge { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 10px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .button:hover { background: #5568d3; }
          .token-box { background: white; border: 1px dashed #ddd; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 14px; text-align: center; margin: 20px 0; word-break: break-all; }
          .footer { color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p><strong>${invitedBy}</strong> has invited you to join <strong>${orgName}</strong> on ColabX.</p>

            <p>You'll be joining as:</p>
            <div class="role-badge">${roleLabels[role] || role}</div>

            <h2 style="color: #667eea;">How to Join:</h2>
            <p><strong>Option 1: Click the button below</strong></p>
            <a href="${inviteLink}" class="button">Accept Invitation</a>

            <p><strong>Option 2: Use your invitation code</strong></p>
            <p>Visit <a href="${APP_URL}/auth">${APP_URL}/auth</a> and select "Join Organization", then enter your code:</p>
            <div class="token-box">${token}</div>

            <p style="color: #999; font-size: 13px;">This invitation will expire in 7 days.</p>
          </div>
          <div class="footer">
            <p>ColabX — Partnership & OKR Management Platform</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const plainTextContent = `
Hi there,

${invitedBy} has invited you to join ${orgName} on ColabX.

You'll be joining as: ${roleLabels[role] || role}

To accept the invitation, visit: ${inviteLink}

Or use your invitation code: ${token}

This invitation will expire in 7 days.

---
ColabX — Partnership & OKR Management Platform
If you didn't expect this invitation, you can safely ignore this email.
  `.trim();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html: htmlContent,
    text: plainTextContent,
  });

  console.log(`Invitation email sent to ${to}`);
}

