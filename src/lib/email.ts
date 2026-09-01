import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANT: without a verified custom domain on Resend, the "from" address
// must stay on their shared testing domain (onboarding@resend.dev), and
// Resend will only actually deliver to the email address you signed up to
// Resend with — not to real students. Once darasalive.co.ke (or whichever
// domain you connect) is verified in the Resend dashboard, switch
// RESEND_FROM_EMAIL to something like "DarasaLive <noreply@darasalive.co.ke>".
const FROM = process.env.RESEND_FROM_EMAIL ?? 'DarasaLive <onboarding@resend.dev>';

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your DarasaLive password',
    html: `
      <p>Someone requested a password reset for this DarasaLive account.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  });
}
