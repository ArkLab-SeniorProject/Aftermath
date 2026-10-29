import nodemailer from 'nodemailer';

const smtpPort = Number(process.env.SMTP_PORT ?? 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? '"Aftermath" <noreply@aftermath.app>',
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #045966;">Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="background: #045966; color: #fff; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-weight: 600;">
            Reset my password
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 15 minutes. If you didn&rsquo;t request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
