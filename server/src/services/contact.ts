import type { ContactMessage } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { logger } from '../config/logger';
import { sendContactNotification } from './mailer';
import { getNotificationRecipient } from './settings';

type ContactInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  reason?: string;
  website?: string;
};

export const createContactMessage = async (input: ContactInput) => {
  if (input.website && input.website.trim().length > 0) {
    logger.warn({ path: '/api/contact' }, 'Contact form honeypot triggered');
    return { accepted: true, emailNotified: false, message: null as ContactMessage | null };
  }

  const message = await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      subject: input.subject,
      message: input.message,
      reason: input.reason ?? null,
    },
  });

  const recipient = await getNotificationRecipient();
  let emailNotified = false;

  if (recipient) {
    const result = await sendContactNotification(
      {
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        reason: message.reason,
        createdAt: message.createdAt,
        dashboardUrl: `${env.SITE_URL.replace(/\/$/, '')}/admin/messages`,
      },
      recipient,
    );
    emailNotified = result.sent;
    if (!result.sent) {
      logger.warn(
        { messageId: message.id, reason: result.reason },
        'Contact message saved but email notification was not delivered',
      );
    }
  } else {
    logger.info(
      { messageId: message.id },
      'Contact message saved without email notification (no recipient configured)',
    );
  }

  return { accepted: true, emailNotified, message };
};
