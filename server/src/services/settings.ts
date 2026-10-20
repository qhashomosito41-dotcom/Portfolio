import { env } from '../config/env';
import { prisma } from '../config/prisma';

export const SETTING_KEYS = {
  footerTagline: 'footerTagline',
  contactNotificationEmail: 'contactNotificationEmail',
  siteUrl: 'siteUrl',
  smtpConfiguredAt: 'smtpConfiguredAt',
} as const;

export const getSetting = async (key: string, fallback = ''): Promise<string> => {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value ?? fallback;
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
};

export const getSeveralSettings = async (keys: string[]): Promise<Record<string, string>> => {
  const settings = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
};

export const getNotificationRecipient = async (): Promise<string | null> => {
  const configured = await getSetting(SETTING_KEYS.contactNotificationEmail, '');
  return configured || env.CONTACT_NOTIFICATION_EMAIL || null;
};

export const publicSettings = async () => {
  const [footerTagline, siteUrl] = await Promise.all([
    getSetting(SETTING_KEYS.footerTagline, ''),
    getSetting(SETTING_KEYS.siteUrl, env.SITE_URL),
  ]);
  return { footerTagline, siteUrl };
};
