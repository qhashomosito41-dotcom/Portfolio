import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError, notFound } from '../utils/errors';
import { stringifyStringList } from '../utils/json';
import { isValidSlug, slugify } from '../utils/slug';
import { deleteStoredFile, detectImage, saveBuffer } from './storage';
import { toAdminProject } from './serializers';

type ProjectInput = {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  projectStatus: string;
  contribution: string | null;
  keyFeatures: string[];
  challenges: string | null;
  solutions: string | null;
  technologies: string[];
  repositoryUrl: string | null;
  liveUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  featured: boolean;
  published: boolean;
  sortOrder?: number;
};

const ensureUniqueSlug = async (desired: string, excludeId?: number): Promise<string> => {
  const base = slugify(desired);
  let candidate = base;
  let counter = 1;
  for (;;) {
    const existing = await prisma.project.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
};

const projectData = (input: ProjectInput, slug: string) => ({
  title: input.title,
  slug,
  shortDescription: input.shortDescription,
  fullDescription: input.fullDescription,
  category: input.category,
  projectStatus: input.projectStatus,
  contribution: input.contribution,
  keyFeatures: stringifyStringList(input.keyFeatures),
  challenges: input.challenges,
  solutions: input.solutions,
  technologies: stringifyStringList(input.technologies),
  repositoryUrl: input.repositoryUrl,
  liveUrl: input.liveUrl,
  startDate: input.startDate,
  endDate: input.endDate,
  featured: input.featured,
  published: input.published,
  ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
});

export const listAdminProjects = async (options: {
  q?: string;
  state?: 'published' | 'draft' | 'featured' | 'all';
  page: number;
  pageSize: number;
}) => {
  const where: Prisma.ProjectWhereInput = {
    ...(options.state === 'published' ? { published: true } : {}),
    ...(options.state === 'draft' ? { published: false } : {}),
    ...(options.state === 'featured' ? { featured: true } : {}),
    ...(options.q
      ? {
          OR: [
            { title: { contains: options.q } },
            { category: { contains: options.q } },
            { technologies: { contains: options.q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    items: items.map(toAdminProject),
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      total,
      totalPages: Math.ceil(total / options.pageSize),
    },
  };
};

export const getAdminProject = async (id: number) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
  });
  if (!project) throw notFound('Project not found');
  return toAdminProject(project);
};

export const createProject = async (input: ProjectInput) => {
  const max = await prisma.project.aggregate({ _max: { sortOrder: true } });
  const slug = await ensureUniqueSlug(input.slug || input.title);
  const project = await prisma.project.create({
    data: {
      ...projectData(input, slug),
      sortOrder: input.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
    },
    include: { images: true },
  });
  return toAdminProject(project);
};

export const updateProject = async (id: number, input: ProjectInput) => {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw notFound('Project not found');

  const requestedSlug = input.slug && isValidSlug(input.slug) ? input.slug : existing.slug;
  const slug =
    requestedSlug !== existing.slug ? await ensureUniqueSlug(requestedSlug, id) : existing.slug;

  const project = await prisma.project.update({
    where: { id },
    data: projectData(input, slug),
    include: { images: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
  });
  return toAdminProject(project);
};

export const deleteProject = async (id: number) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!project) throw notFound('Project not found');

  await prisma.project.delete({ where: { id } });
  await Promise.all(project.images.map((image) => deleteStoredFile(image.filePath)));
};

export const reorderProjects = async (ids: number[]) => {
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.project.update({ where: { id }, data: { sortOrder: index + 1 } }),
    ),
  );
};

export const addProjectImage = async (
  projectId: number,
  buffer: Buffer,
  altText?: string | null,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound('Project not found');

  const detected = detectImage(buffer);
  if (!detected) {
    throw new AppError(422, 'INVALID_FILE_TYPE', 'Upload a PNG, JPEG, WebP, or GIF image');
  }

  const filePath = await saveBuffer(buffer, 'projects', detected);
  try {
    const max = await prisma.projectImage.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });
    return await prisma.projectImage.create({
      data: {
        projectId,
        filePath,
        altText: altText ?? project.title,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
  } catch (error) {
    await deleteStoredFile(filePath);
    throw error;
  }
};

export const updateProjectImage = async (
  projectId: number,
  imageId: number,
  data: { altText: string | null; sortOrder?: number },
) => {
  const image = await prisma.projectImage.findFirst({ where: { id: imageId, projectId } });
  if (!image) throw notFound('Project image not found');
  return prisma.projectImage.update({
    where: { id: imageId },
    data: {
      altText: data.altText,
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });
};

export const deleteProjectImage = async (projectId: number, imageId: number) => {
  const image = await prisma.projectImage.findFirst({ where: { id: imageId, projectId } });
  if (!image) throw notFound('Project image not found');
  await prisma.projectImage.delete({ where: { id: imageId } });
  await deleteStoredFile(image.filePath);
};

export const reorderProjectImages = async (projectId: number, ids: number[]) => {
  const images = await prisma.projectImage.findMany({
    where: { projectId, id: { in: ids } },
    select: { id: true },
  });
  if (images.length !== ids.length) {
    throw notFound('One or more project images could not be found');
  }
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.projectImage.update({ where: { id }, data: { sortOrder: index + 1 } }),
    ),
  );
};
