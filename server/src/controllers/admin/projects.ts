import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError, notFound } from '../../utils/errors';
import { adminProjectListQuery } from '../../validators/common';
import {
  addProjectImage,
  createProject,
  deleteProject,
  deleteProjectImage,
  getAdminProject,
  listAdminProjects,
  reorderProjectImages,
  reorderProjects,
  updateProject,
  updateProjectImage,
} from '../../services/projects';

const imageBody = z.object({
  altText: z.string().trim().max(255).optional(),
});

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as z.infer<typeof adminProjectListQuery>;
  const data = await listAdminProjects(query);
  res.json({ success: true, data });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAdminProject(Number(req.params.id));
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const project = await createProject(req.body);
  res.status(201).json({ success: true, data: project });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const project = await updateProject(Number(req.params.id), req.body);
  res.json({ success: true, data: project });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteProject(Number(req.params.id));
  res.json({ success: true, data: { message: 'Project deleted' } });
});

export const reorder = asyncHandler(async (req: Request, res: Response) => {
  await reorderProjects(req.body.ids);
  res.json({ success: true, data: { message: 'Project order updated' } });
});

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(422, 'FILE_REQUIRED', 'Select an image to upload');
  const parsed = imageBody.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid image details', parsed.error.flatten());
  }
  const image = await addProjectImage(
    Number(req.params.id),
    req.file.buffer,
    parsed.data.altText ?? null,
  );
  const project = await getAdminProject(Number(req.params.id));
  res.status(201).json({ success: true, data: { image, project } });
});

export const updateImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await updateProjectImage(
    Number(req.params.id),
    Number(req.params.imageId),
    req.body,
  );
  res.json({ success: true, data: image });
});

export const removeImage = asyncHandler(async (req: Request, res: Response) => {
  await deleteProjectImage(Number(req.params.id), Number(req.params.imageId));
  res.json({ success: true, data: { message: 'Image removed' } });
});

export const reorderImages = asyncHandler(async (req: Request, res: Response) => {
  await reorderProjectImages(Number(req.params.id), req.body.ids);
  res.json({ success: true, data: { message: 'Image order updated' } });
});

export const projectNotFound = notFound('Project not found');
