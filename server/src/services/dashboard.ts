import { prisma } from '../config/prisma';
import { toAdminCv, toAdminMessage, toAdminProject } from './serializers';

export const getDashboardData = async () => {
  const [
    totalProjects,
    publishedProjects,
    totalSkills,
    totalExperience,
    totalEducation,
    totalCertifications,
    unreadMessages,
    totalMessages,
    activeCv,
    recentMessages,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.education.count(),
    prisma.certification.count(),
    prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    prisma.contactMessage.count(),
    prisma.cVDocument.findFirst({ where: { isActive: true }, orderBy: { uploadedAt: 'desc' } }),
    prisma.contactMessage.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.project.findMany({
      include: { images: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    stats: {
      totalProjects,
      publishedProjects,
      draftProjects: totalProjects - publishedProjects,
      totalSkills,
      totalExperience,
      totalEducation,
      totalCertifications,
      unreadMessages,
      totalMessages,
    },
    cv: activeCv ? toAdminCv(activeCv) : null,
    recentMessages: recentMessages.map(toAdminMessage),
    recentProjects: recentProjects.map(toAdminProject),
  };
};
