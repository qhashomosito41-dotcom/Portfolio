import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError, notFound } from '../../utils/errors';
import { isSmtpConfigured, sendTestEmail } from '../../services/mailer';
import {
  getNotificationRecipient,
  getSeveralSettings,
  SETTING_KEYS,
} from '../../services/settings';

const readSettings = async () => {
  const [profile, settings, recipient] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 } }),
    getSeveralSettings([
      SETTING_KEYS.footerTagline,
      SETTING_KEYS.contactNotificationEmail,
      SETTING_KEYS.siteUrl,
    ]),
    getNotificationRecipient(),
  ]);
  return {
    websiteTitle: profile?.websiteTitle ?? '',
    websiteDescription: profile?.websiteDescription ?? '',
    footerTagline: settings[SETTING_KEYS.footerTagline] ?? '',
    contactNotificationEmail: settings[SETTING_KEYS.contactNotificationEmail] ?? '',
    siteUrl: settings[SETTING_KEYS.siteUrl] ?? env.SITE_URL,
    smtpConfigured: isSmtpConfigured(),
    effectiveNotificationRecipient: recipient,
  };
};

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const data = await readSettings();
  res.json({ success: true, data });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!profile) throw notFound('Profile has not been initialised');

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: 1 },
      data: {
        websiteTitle: body.websiteTitle,
        websiteDescription: body.websiteDescription,
      },
    }),
    prisma.siteSetting.upsert({
      where: { key: SETTING_KEYS.footerTagline },
      update: { value: body.footerTagline ?? '' },
      create: { key: SETTING_KEYS.footerTagline, value: body.footerTagline ?? '' },
    }),
    prisma.siteSetting.upsert({
      where: { key: SETTING_KEYS.contactNotificationEmail },
      update: { value: body.contactNotificationEmail ?? '' },
      create: {
        key: SETTING_KEYS.contactNotificationEmail,
        value: body.contactNotificationEmail ?? '',
      },
    }),
    prisma.siteSetting.upsert({
      where: { key: SETTING_KEYS.siteUrl },
      update: { value: body.siteUrl ?? '' },
      create: { key: SETTING_KEYS.siteUrl, value: body.siteUrl ?? '' },
    }),
  ]);

  const data = await readSettings();
  res.json({ success: true, data });
});

export const testEmail = asyncHandler(async (req: Request, res: Response) => {
  const recipient =
    req.body.recipient || (await getNotificationRecipient()) || req.admin?.email || '';
  if (!recipient) {
    throw new AppError(
      400,
      'NO_RECIPIENT',
      'Provide a recipient or configure a notification email first',
    );
  }
  await sendTestEmail(recipient);
  res.json({ success: true, data: { message: `Test email sent to ${recipient}` } });
});
