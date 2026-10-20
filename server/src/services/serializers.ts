import type {
  Certification,
  ContactMessage,
  CVDocument,
  Education,
  Experience,
  Profile,
  Project,
  ProjectImage,
  Skill,
  SocialLink,
} from '@prisma/client';
import { parseStringList } from '../utils/json';

const initialsFor = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const mediaUrl = (filePath: string | null | undefined): string | null =>
  filePath ? `/api/media/${filePath}` : null;

export const toPublicProfile = (profile: Profile | null) => {
  if (!profile) return null;
  return {
    fullName: profile.fullName,
    professionalTitle: profile.professionalTitle,
    headline: profile.headline,
    heroIntro: profile.heroIntro,
    heroTechSummary: parseStringList(profile.heroTechSummary),
    biography: profile.biography,
    academicBackground: profile.academicBackground,
    approach: profile.approach,
    careerObjectives: profile.careerObjectives,
    professionalInterests: parseStringList(profile.professionalInterests),
    location: profile.location,
    contactEmail: profile.contactEmail,
    profileImageUrl: mediaUrl(profile.profileImagePath),
    avatarInitials: initialsFor(profile.fullName),
    websiteTitle: profile.websiteTitle,
    websiteDescription: profile.websiteDescription,
  };
};

export const toAdminProfile = (profile: Profile | null) => {
  if (!profile) return null;
  return {
    ...profile,
    heroTechSummary: parseStringList(profile.heroTechSummary),
    professionalInterests: parseStringList(profile.professionalInterests),
    profileImageUrl: mediaUrl(profile.profileImagePath),
    avatarInitials: initialsFor(profile.fullName),
  };
};

type ProjectWithImages = Project & { images?: ProjectImage[] };

const projectImages = (images: ProjectImage[] | undefined) =>
  (images ?? []).map((image) => ({
    id: image.id,
    url: mediaUrl(image.filePath),
    altText: image.altText,
    sortOrder: image.sortOrder,
  }));

export const toPublicProject = (project: ProjectWithImages, detail = false) => {
  const images = projectImages(project.images);
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    fullDescription: detail ? project.fullDescription : undefined,
    category: project.category,
    projectStatus: project.projectStatus,
    contribution: detail ? project.contribution : undefined,
    keyFeatures: detail ? parseStringList(project.keyFeatures) : undefined,
    challenges: detail ? project.challenges : undefined,
    solutions: detail ? project.solutions : undefined,
    technologies: parseStringList(project.technologies),
    repositoryUrl: project.repositoryUrl,
    liveUrl: project.liveUrl,
    startDate: project.startDate,
    endDate: project.endDate,
    featured: project.featured,
    coverImage: images[0] ?? null,
    images: detail ? images : undefined,
    updatedAt: project.updatedAt,
  };
};

export const toAdminProject = (project: ProjectWithImages) => ({
  ...project,
  technologies: parseStringList(project.technologies),
  keyFeatures: parseStringList(project.keyFeatures),
  images: projectImages(project.images),
  coverImage: projectImages(project.images)[0] ?? null,
});

export const toPublicSkill = (skill: Skill) => ({
  id: skill.id,
  name: skill.name,
  category: skill.category,
  description: skill.description,
  proficiencyLabel: skill.proficiencyLabel,
  context: skill.context,
});

export const toPublicExperience = (experience: Experience) => ({
  id: experience.id,
  organization: experience.organization,
  position: experience.position,
  type: experience.type,
  location: experience.location,
  startDate: experience.startDate,
  endDate: experience.endDate,
  isCurrent: experience.isCurrent,
  responsibilities: parseStringList(experience.responsibilities),
  achievements: parseStringList(experience.achievements),
  technologies: parseStringList(experience.technologies),
  evidenceUrl: experience.evidenceUrl,
});

export const toAdminExperience = (experience: Experience) => ({
  ...experience,
  responsibilities: parseStringList(experience.responsibilities),
  achievements: parseStringList(experience.achievements),
  technologies: parseStringList(experience.technologies),
});

export const toPublicEducation = (education: Education) => ({
  id: education.id,
  institution: education.institution,
  qualification: education.qualification,
  fieldOfStudy: education.fieldOfStudy,
  location: education.location,
  startDate: education.startDate,
  endDate: education.endDate,
  isCurrent: education.isCurrent,
  description: education.description,
  modules: parseStringList(education.modules),
  achievements: parseStringList(education.achievements),
});

export const toAdminEducation = (education: Education) => ({
  ...education,
  modules: parseStringList(education.modules),
  achievements: parseStringList(education.achievements),
});

export const toPublicCertification = (certification: Certification) => ({
  id: certification.id,
  title: certification.title,
  provider: certification.provider,
  completionDate: certification.completionDate,
  description: certification.description,
  credentialId: certification.credentialId,
  verificationUrl: certification.verificationUrl,
  certificateUrl: certification.certificatePath
    ? `/api/certifications/${certification.id}/certificate`
    : null,
});

export const toAdminCertification = (certification: Certification) => ({
  ...certification,
  certificateUrl: certification.certificatePath
    ? `/api/admin/certifications/${certification.id}/certificate`
    : null,
});

export const toPublicSocialLink = (link: SocialLink) => ({
  id: link.id,
  platform: link.platform,
  label: link.label,
  url: link.url,
  icon: link.icon,
});

export const toPublicCv = (cv: CVDocument | null) =>
  cv
    ? {
        id: cv.id,
        title: cv.title,
        fileSize: cv.fileSize,
        uploadedAt: cv.uploadedAt,
        downloadUrl: '/api/cv/download',
      }
    : null;

export const toAdminCv = (cv: CVDocument) => ({
  id: cv.id,
  title: cv.title,
  originalName: cv.originalName,
  mimeType: cv.mimeType,
  fileSize: cv.fileSize,
  isActive: cv.isActive,
  isPublic: cv.isPublic,
  uploadedAt: cv.uploadedAt,
  previewUrl: `/api/admin/cv/${cv.id}/preview`,
  downloadUrl: `/api/admin/cv/${cv.id}/download`,
});

export const toAdminMessage = (message: ContactMessage) => ({
  ...message,
});
