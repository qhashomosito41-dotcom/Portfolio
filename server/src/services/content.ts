import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { notFound } from '../utils/errors';
import { publicSettings } from './settings';
import {
  toPublicCertification,
  toPublicCv,
  toPublicEducation,
  toPublicExperience,
  toPublicProfile,
  toPublicProject,
  toPublicSkill,
  toPublicSocialLink,
} from './serializers';

const SKILL_CATEGORY_ORDER = [
  'Programming Languages',
  'Web Development',
  'Databases',
  'Tools & Platforms',
  'Additional Areas',
];

const sortSkills = <T extends { category: string; sortOrder: number }>(skills: T[]): T[] =>
  [...skills].sort((left, right) => {
    const leftIndex = SKILL_CATEGORY_ORDER.indexOf(left.category);
    const rightIndex = SKILL_CATEGORY_ORDER.indexOf(right.category);
    const leftOrder = leftIndex === -1 ? SKILL_CATEGORY_ORDER.length : leftIndex;
    const rightOrder = rightIndex === -1 ? SKILL_CATEGORY_ORDER.length : rightIndex;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return left.sortOrder - right.sortOrder;
  });

export const getPublicHome = async () => {
  const [
    profile,
    skills,
    projects,
    experiences,
    educations,
    certifications,
    socialLinks,
    cv,
    settings,
  ] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 } }),
    prisma.skill.findMany({ where: { visible: true } }),
    prisma.project.findMany({
      where: { published: true },
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { endDate: 'desc' }],
    }),
    prisma.experience.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    }),
    prisma.education.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
    }),
    prisma.certification.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { completionDate: 'desc' }],
    }),
    prisma.socialLink.findMany({
      where: { visible: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }),
    prisma.cVDocument.findFirst({
      where: { isActive: true, isPublic: true },
      orderBy: { uploadedAt: 'desc' },
    }),
    publicSettings(),
  ]);

  const sortedSkills = sortSkills(skills);

  return {
    profile: toPublicProfile(profile),
    skills: sortedSkills.map(toPublicSkill),
    projects: projects.map((project) => toPublicProject(project)),
    experience: experiences.map(toPublicExperience),
    education: educations.map(toPublicEducation),
    certifications: certifications.map(toPublicCertification),
    socialLinks: socialLinks.map(toPublicSocialLink),
    cv: toPublicCv(cv),
    site: {
      title: profile?.websiteTitle ?? 'Mosito | Web Design, Development & SEO',
      description: profile?.websiteDescription ?? '',
      footerTagline: settings.footerTagline,
      siteUrl: settings.siteUrl || env.SITE_URL,
    },
  };
};

export const getPublicProject = async (slug: string) => {
  const project = await prisma.project.findFirst({
    where: { slug, published: true },
    include: { images: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
  });
  if (!project) throw notFound('That project could not be found');
  return toPublicProject(project, true);
};

export const listPublishedProjects = async (options: {
  category?: string;
  q?: string;
  page: number;
  pageSize: number;
}) => {
  const where = {
    published: true,
    ...(options.category ? { category: options.category } : {}),
    ...(options.q
      ? {
          OR: [
            { title: { contains: options.q } },
            { shortDescription: { contains: options.q } },
            { technologies: { contains: options.q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { endDate: 'desc' }],
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    items: items.map((project) => toPublicProject(project)),
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      total,
      totalPages: Math.ceil(total / options.pageSize),
    },
  };
};

export const listPublishedSlugs = async (): Promise<{ slug: string; updatedAt: Date }[]> =>
  prisma.project.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });

export const getPublicCv = async () => {
  const cv = await prisma.cVDocument.findFirst({
    where: { isActive: true, isPublic: true },
    orderBy: { uploadedAt: 'desc' },
  });
  return toPublicCv(cv);
};

export const getPublicProfile = async () => {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  return toPublicProfile(profile);
};
