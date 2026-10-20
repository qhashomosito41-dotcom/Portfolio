import { Router } from 'express';
import {
  downloadCv,
  getCertificate,
  getCvMetadata,
  getHome,
  getProfile,
  getProject,
  getPublicSiteSettings,
  listCertifications,
  listEducation,
  listExperience,
  listProjects,
  listSkills,
  listSocialLinks,
  projectQuery,
} from '../controllers/public';
import { validateQuery } from '../middleware/validate';
import { getMedia } from '../controllers/media';

export const publicRouter = Router();

publicRouter.get('/home', getHome);
publicRouter.get('/profile', getProfile);
publicRouter.get('/projects', validateQuery(projectQuery), listProjects);
publicRouter.get('/projects/:slug', getProject);
publicRouter.get('/skills', listSkills);
publicRouter.get('/experience', listExperience);
publicRouter.get('/education', listEducation);
publicRouter.get('/certifications', listCertifications);
publicRouter.get('/certifications/:id/certificate', getCertificate);
publicRouter.get('/social-links', listSocialLinks);
publicRouter.get('/cv', getCvMetadata);
publicRouter.get('/cv/download', downloadCv);
publicRouter.get('/settings', getPublicSiteSettings);
publicRouter.get('/media/:kind/:filename', getMedia);
