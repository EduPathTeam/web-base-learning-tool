import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM || 'EduPath <onboarding@resend.dev>';

function passwordResetHtml(resetUrl) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1a1a1a;">Reset your EduPath password</h2>
      <p>We received a request to reset your password. This link expires in 1 hour.</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #2e7dff; color: #fff; border-radius: 6px; text-decoration: none;">
          Reset Password
        </a>
      </p>
      <p style="color: #6b7280; font-size: 13px;">
        If you didn't request this, you can safely ignore this email — your password won't be changed.
      </p>
    </div>
  `;
}

// A mutable object (rather than a standalone named export) so tests can
// swap out `.send` with a mock without needing ESM module-mocking support.
export const emailer = {
  async send(toEmail, resetUrl) {
    if (!resend) throw new Error('RESEND_API_KEY is not configured.');

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: 'Reset your EduPath password',
      html: passwordResetHtml(resetUrl),
      text: `Reset your EduPath password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    });

    if (error) throw new Error(error.message || 'Failed to send password reset email.');
  },
};
