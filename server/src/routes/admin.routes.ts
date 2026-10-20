import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireCsrf } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  adminMessageListQuery,
  adminProjectListQuery,
  idParam,
  messageUpdateSchema,
  reorderSchema,
} from '../validators/common';
import {
  certificationSchema,
  cvUpdateSchema,
  cvUploadSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectImageUpdateSchema,
  projectSchema,
  settingsSchema,
  skillSchema,
  socialLinkSchema,
  testEmailSchema,
} from '../validators/entities';
import {
  uploadCertificate,
  uploadCv,
  uploadProfileImage,
  uploadProjectImage,
} from '../middleware/upload';
import { getDashboard } from '../controllers/admin/dashboard';
import {
  getProfile,
  removeProfileImage,
  updateProfile,
  uploadProfileImage as uploadProfileImageController,
} from '../controllers/admin/profile';
import {
  create as createProject,
  getProject,
  listProjects,
  remove as removeProject,
  removeImage,
  reorder as reorderProjects,
  reorderImages,
  update as updateProject,
  updateImage,
  uploadImage,
} from '../controllers/admin/projects';
import {
  createSkill,
  deleteSkill,
  listSkills,
  reorderSkills,
  updateSkill,
} from '../controllers/admin/skills';
import {
  createExperience,
  deleteExperience,
  listExperience,
  reorderExperience,
  updateExperience,
} from '../controllers/admin/experience';
import {
  createEducation,
  deleteEducation,
  listEducation,
  reorderEducation,
  updateEducation,
} from '../controllers/admin/education';
import {
  createCertification,
  deleteCertification,
  listCertifications,
  reorderCertifications,
  removeCertificate,
  updateCertification,
  uploadCertificate as uploadCertificateController,
} from '../controllers/admin/certifications';
import {
  download as downloadCv,
  getCurrentCv,
  preview as previewCv,
  remove as removeCv,
  update as updateCv,
  upload as uploadCvController,
} from '../controllers/admin/cv';
import {
  deleteMessage,
  getMessage,
  listMessages,
  updateMessage,
} from '../controllers/admin/messages';
import {
  createSocialLink,
  deleteSocialLink,
  listSocialLinks,
  reorderSocialLinks,
  updateSocialLink,
} from '../controllers/admin/socialLinks';
import { getSettings, testEmail, updateSettings } from '../controllers/admin/settings';
import { getAdminCertificate } from '../controllers/media';
import { asyncHandler } from '../utils/asyncHandler';

export const adminRouter = Router();

adminRouter.use(requireAdmin);
adminRouter.use(requireCsrf);

adminRouter.get('/dashboard', getDashboard);

adminRouter.get('/profile', getProfile);
adminRouter.put('/profile', validateBody(profileSchema), updateProfile);
adminRouter.post('/profile/image', uploadProfileImage, uploadProfileImageController);
adminRouter.delete('/profile/image', removeProfileImage);

adminRouter.get('/projects', validateQuery(adminProjectListQuery), listProjects);
adminRouter.put('/projects/reorder', validateBody(reorderSchema), reorderProjects);
adminRouter.post('/projects', validateBody(projectSchema), createProject);
adminRouter.get('/projects/:id', validateParams(idParam), getProject);
adminRouter.put(
  '/projects/:id',
  validateParams(idParam),
  validateBody(projectSchema),
  updateProject,
);
adminRouter.delete('/projects/:id', validateParams(idParam), removeProject);
adminRouter.post('/projects/:id/images', validateParams(idParam), uploadProjectImage, uploadImage);
adminRouter.put(
  '/projects/:id/images/reorder',
  validateParams(idParam),
  validateBody(reorderSchema),
  reorderImages,
);
adminRouter.put(
  '/projects/:id/images/:imageId',
  validateParams(idParam.extend({ imageId: z.coerce.number().int().positive() })),
  validateBody(projectImageUpdateSchema),
  updateImage,
);
adminRouter.delete(
  '/projects/:id/images/:imageId',
  validateParams(idParam.extend({ imageId: z.coerce.number().int().positive() })),
  removeImage,
);

adminRouter.get('/skills', listSkills);
adminRouter.put('/skills/reorder', validateBody(reorderSchema), reorderSkills);
adminRouter.post('/skills', validateBody(skillSchema), createSkill);
adminRouter.put('/skills/:id', validateParams(idParam), validateBody(skillSchema), updateSkill);
adminRouter.delete('/skills/:id', validateParams(idParam), deleteSkill);

adminRouter.get('/experience', listExperience);
adminRouter.put('/experience/reorder', validateBody(reorderSchema), reorderExperience);
adminRouter.post('/experience', validateBody(experienceSchema), createExperience);
adminRouter.put(
  '/experience/:id',
  validateParams(idParam),
  validateBody(experienceSchema),
  updateExperience,
);
adminRouter.delete('/experience/:id', validateParams(idParam), deleteExperience);

adminRouter.get('/education', listEducation);
adminRouter.put('/education/reorder', validateBody(reorderSchema), reorderEducation);
adminRouter.post('/education', validateBody(educationSchema), createEducation);
adminRouter.put(
  '/education/:id',
  validateParams(idParam),
  validateBody(educationSchema),
  updateEducation,
);
adminRouter.delete('/education/:id', validateParams(idParam), deleteEducation);

adminRouter.get('/certifications', listCertifications);
adminRouter.put('/certifications/reorder', validateBody(reorderSchema), reorderCertifications);
adminRouter.post('/certifications', validateBody(certificationSchema), createCertification);
adminRouter.put(
  '/certifications/:id',
  validateParams(idParam),
  validateBody(certificationSchema),
  updateCertification,
);
adminRouter.delete('/certifications/:id', validateParams(idParam), deleteCertification);
adminRouter.post(
  '/certifications/:id/certificate',
  validateParams(idParam),
  uploadCertificate,
  uploadCertificateController,
);
adminRouter.delete('/certifications/:id/certificate', validateParams(idParam), removeCertificate);
adminRouter.get('/certifications/:id/certificate', validateParams(idParam), getAdminCertificate);

adminRouter.get('/cv', getCurrentCv);
adminRouter.post('/cv', uploadCv, validateBody(cvUploadSchema), uploadCvController);
adminRouter.put('/cv/:id', validateParams(idParam), validateBody(cvUpdateSchema), updateCv);
adminRouter.delete('/cv/:id', validateParams(idParam), removeCv);
adminRouter.get('/cv/:id/download', validateParams(idParam), downloadCv);
adminRouter.get('/cv/:id/preview', validateParams(idParam), previewCv);

adminRouter.get('/messages', validateQuery(adminMessageListQuery), listMessages);
adminRouter.get('/messages/:id', validateParams(idParam), getMessage);
adminRouter.patch(
  '/messages/:id',
  validateParams(idParam),
  validateBody(messageUpdateSchema),
  updateMessage,
);
adminRouter.delete('/messages/:id', validateParams(idParam), deleteMessage);

adminRouter.get('/social-links', listSocialLinks);
adminRouter.put('/social-links/reorder', validateBody(reorderSchema), reorderSocialLinks);
adminRouter.post('/social-links', validateBody(socialLinkSchema), createSocialLink);
adminRouter.put(
  '/social-links/:id',
  validateParams(idParam),
  validateBody(socialLinkSchema),
  updateSocialLink,
);
adminRouter.delete('/social-links/:id', validateParams(idParam), deleteSocialLink);

adminRouter.get('/settings', getSettings);
adminRouter.put('/settings', validateBody(settingsSchema), updateSettings);
adminRouter.post('/email/test', validateBody(testEmailSchema), testEmail);

adminRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: { ok: true } });
  }),
);
