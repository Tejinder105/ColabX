const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || 'tejinderpalsinghc3@gmail.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME?.trim() || 'ColabX';

interface SendInvitationEmailInput {
  to: string;
  orgName: string;
  invitedBy: string;
  token: string;
  role: 'admin' | 'manager' | 'partner';
}

async function sendEmail({
  from,
  fromName,
  to,
  subject,
  html,
  text,
}: {
  from: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured.');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: fromName, email: from },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
  }
}

export async function sendInvitationEmail({
  to,
  orgName,
  invitedBy,
  token,
  role,
}: SendInvitationEmailInput): Promise<void> {
  if (!BREVO_API_KEY) {
    throw new Error('Email is not configured. Set BREVO_API_KEY env variable.');
  }

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

  try {
    await sendEmail({
      from: EMAIL_FROM,
      fromName: EMAIL_FROM_NAME,
      to,
      subject,
      html: htmlContent,
      text: plainTextContent,
    });

    console.log(`Invitation email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    throw error;
  }
}
