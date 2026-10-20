import { Router } from 'express';
import { robots, sitemap } from '../controllers/seo';

export const seoRouter = Router();

seoRouter.get('/robots.txt', robots);
seoRouter.get('/sitemap.xml', sitemap);
