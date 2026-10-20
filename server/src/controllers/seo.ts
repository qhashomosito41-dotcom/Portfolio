import type { Request, Response } from 'express';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { listPublishedSlugs } from '../services/content';
import { getSetting } from '../services/settings';
import { SETTING_KEYS } from '../services/settings';

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const robots = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSetting(SETTING_KEYS.siteUrl, env.SITE_URL);
  res
    .type('text/plain')
    .send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /admin/',
        'Disallow: /api/admin',
        'Disallow: /api/cv/download',
        '',
        `Sitemap: ${settings.replace(/\/$/, '')}/sitemap.xml`,
        '',
      ].join('\n'),
    );
});

export const sitemap = asyncHandler(async (_req: Request, res: Response) => {
  const [settings, projects] = await Promise.all([
    getSetting(SETTING_KEYS.siteUrl, env.SITE_URL),
    listPublishedSlugs(),
  ]);
  const base = settings.replace(/\/$/, '');
  const urls = [
    `<url><loc>${escapeXml(base)}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>`,
    ...projects.map(
      (project) =>
        `<url><loc>${escapeXml(`${base}/projects/${project.slug}`)}</loc><lastmod>${project.updatedAt.toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
    ),
  ];
  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    );
});
