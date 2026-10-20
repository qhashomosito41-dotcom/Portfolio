import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!env.SMTP_HOST || !env.SMTP_FROM) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASSWORD
          ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
          : undefined,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 15000,
    });
  }
  return transporter;
};

export const isSmtpConfigured = (): boolean => Boolean(env.SMTP_HOST && env.SMTP_FROM);

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

type ContactEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  reason?: string | null;
  createdAt: Date;
  dashboardUrl?: string | null;
};

export const sendContactNotification = async (
  payload: ContactEmailPayload,
  recipient: string,
): Promise<{ sent: boolean; reason?: string }> => {
  const mailer = getTransporter();
  if (!mailer) {
    return { sent: false, reason: 'SMTP is not configured' };
  }

  const safe = {
    name: escapeHtml(payload.name),
    email: escapeHtml(payload.email),
    subject: escapeHtml(payload.subject),
    message: escapeHtml(payload.message).replace(/\r?\n/g, '<br />'),
    reason: payload.reason ? escapeHtml(payload.reason) : 'Not specified',
    createdAt: escapeHtml(payload.createdAt.toISOString()),
    dashboardUrl: payload.dashboardUrl ? escapeHtml(payload.dashboardUrl) : null,
  };

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#111827">
      <h2 style="margin-bottom:8px">New portfolio contact message</h2>
      <p style="color:#4b5563;margin-top:0">Submitted ${safe.createdAt}</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #e5e7eb">${safe.name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #e5e7eb">${safe.email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Subject</td><td style="padding:8px;border:1px solid #e5e7eb">${safe.subject}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold">Reason</td><td style="padding:8px;border:1px solid #e5e7eb">${safe.reason}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;line-height:1.6">${safe.message}</div>
      ${safe.dashboardUrl ? `<p style="margin-top:20px"><a href="${safe.dashboardUrl}">Open the administrator dashboard</a></p>` : ''}
    </div>
  `;

  const text = [
    'New portfolio contact message',
    `Submitted: ${payload.createdAt.toISOString()}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject}`,
    `Reason: ${payload.reason ?? 'Not specified'}`,
    '',
    payload.message,
    payload.dashboardUrl ? `\nDashboard: ${payload.dashboardUrl}` : '',
  ].join('\n');

  try {
    const info = await mailer.sendMail({
      from: env.SMTP_FROM,
      to: recipient,
      replyTo: payload.email,
      subject: `Portfolio contact: ${payload.subject}`.slice(0, 180),
      text,
      html,
    });
    logger.info({ messageId: info.messageId }, 'Contact notification email sent');
    return { sent: true };
  } catch (error) {
    logger.warn(
      { reason: error instanceof Error ? error.message : 'unknown' },
      'Contact notification email failed',
    );
    return { sent: false, reason: 'Email delivery failed' };
  }
};

export const sendTestEmail = async (recipient: string): Promise<void> => {
  const mailer = getTransporter();
  if (!mailer) {
    throw new AppError(
      400,
      'SMTP_NOT_CONFIGURED',
      'SMTP is not configured. Set SMTP_HOST and SMTP_FROM in the server environment.',
    );
  }
  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: recipient,
      subject: 'Portfolio email configuration test',
      text: 'This is a test message from your portfolio email configuration. If you received it, SMTP is working.',
    });
  } catch (error) {
    logger.warn(
      { reason: error instanceof Error ? error.message : 'unknown' },
      'SMTP test email failed',
    );
    throw new AppError(
      502,
      'EMAIL_DELIVERY_FAILED',
      'The test email could not be delivered. Check the SMTP settings and try again.',
    );
  }
};
